FROM python:3.13

WORKDIR /app
RUN mkdir /exported-data

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--port", "8888", "--host", "0.0.0.0"]
