import logging
import gzip

from datetime import datetime
from pathlib import Path

from app.db import get_connection
from app.models import ExportTask
from app.config import settings

logger = logging.getLogger(__name__)


class ExportTaskException(Exception):
    pass


def get_export_task(task_folder: Path) -> ExportTask:
    select_file_path = task_folder / 'select.sql'
    if not select_file_path.exists():
        raise ExportTaskException('select.sql have to exist')

    with select_file_path.open() as select_file:
        select_sql = select_file.read()

    delete_file_path = task_folder / 'delete.sql'
    if not delete_file_path.exists():
        raise ExportTaskException('delete.sql have to exist')

    with delete_file_path.open() as delete_file:
        delete_sql = delete_file.read()

    return ExportTask(
        name=task_folder.name,
        select_query=select_sql,
        delete_query=delete_sql,
    )


def get_export_tasks() -> list[ExportTask]:
    return [
        get_export_task(task) for task in settings.dsl_path.iterdir()
    ]


def perform_export(export_task: ExportTask):
    export_boundary = datetime.now().replace(microsecond=0, second=0, minute=0, hour=0)
    export_boundary_str = export_boundary.strftime("%Y_%m_%d-%I_%M_%S_%p")
    export_path = settings.export_path / f'{export_task.name}-{export_boundary_str}.csv.gz'
    str_path = export_path.as_posix()
    with gzip.open(str_path, 'w') as export_file:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.copy_expert(
                cursor.mogrify(export_task.select_query, {'export_boundary': export_boundary}),
                export_file
            )
            cursor.execute(export_task.delete_query, {'export_boundary': export_boundary})
            cursor.execute('COMMIT;')


def perform_exports():
    logger.info("Starting export...")
    exports = get_export_tasks()
    for export in exports:
        logger.info(f'Exporting {export.name}')
        perform_export(export)
        logger.info(f'Finished exporting {export.name}')
