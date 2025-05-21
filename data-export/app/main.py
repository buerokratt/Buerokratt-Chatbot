from fastapi import FastAPI, BackgroundTasks

from app.dsl import perform_exports

app = FastAPI()


@app.post("/export")
def export(background_tasks: BackgroundTasks):
    background_tasks.add_task(perform_exports)
    return {'status': 'ok'}
