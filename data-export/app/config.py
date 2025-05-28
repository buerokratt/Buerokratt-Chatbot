from pydantic_settings import BaseSettings
from pydantic import PostgresDsn, DirectoryPath


class Settings(BaseSettings):
    db_uri: PostgresDsn
    dsl_path: DirectoryPath = '/DSL'
    export_path: DirectoryPath = '/exported-data'


settings = Settings()
