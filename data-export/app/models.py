from pydantic import BaseModel


class OkResponse(BaseModel):
    status: str = 'Ok'


class ExportTask(BaseModel):
    name: str
    select_query: str
    delete_query: str
