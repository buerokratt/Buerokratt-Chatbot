from pydantic import BaseModel


class ExportTask(BaseModel):
    name: str
    select_query: str
    delete_query: str
