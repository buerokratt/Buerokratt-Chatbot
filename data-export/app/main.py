from fastapi import FastAPI, BackgroundTasks, HTTPException

from app.dsl import perform_exports, get_export_tasks, perform_export
from app.models import OkResponse, ExportTask

app = FastAPI()


@app.post("/exports")
def trigger_all_exports(background_tasks: BackgroundTasks) -> OkResponse:
    background_tasks.add_task(perform_exports)
    return OkResponse()


@app.get("/exports")
def get_all_exports() -> list[ExportTask]:
    return get_export_tasks()


@app.get("/exports/{task_name}")
def get_specified_export_task(task_name: str) -> ExportTask:
    for task in get_export_tasks():
        if task.name == task_name:
            return task

    raise HTTPException(status_code=404, detail='Task not found')


@app.post("/exports/{task_name}")
def trigger_specified_export_task(task_name: str, background_tasks: BackgroundTasks) -> OkResponse:
    task_to_trigger = None
    for task in get_export_tasks():
        if task.name == task_name:
            task_to_trigger = task
            break

    if task_to_trigger is None:
        raise HTTPException(status_code=404, detail='Task not found')

    background_tasks.add_task(perform_export, task_to_trigger)

    return OkResponse()
