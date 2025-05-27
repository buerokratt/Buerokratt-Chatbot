import psycopg2

from app.config import settings


def get_connection() -> psycopg2.extensions.connection:
    return psycopg2.connect(settings.db_uri.unicode_string())
