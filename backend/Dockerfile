FROM python:3.12-slim

WORKDIR /app

ENV PIP_DEFAULT_TIMEOUT=120 \
    PIP_RETRIES=10

COPY backend/pyproject.toml ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir .

COPY backend/app ./app
COPY backend/alembic.ini ./
COPY backend/alembic ./alembic
COPY VERSION ./VERSION

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
