# Use Python 3.12 to satisfy Django 6.x requirement
FROM python:3.12-alpine

# Prevent Python from writing pyc files and enable unbuffered stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install build and runtime dependencies
RUN apk add --no-cache --virtual .build-deps \
        build-base \
        postgresql-dev \
        libffi-dev \
        openssl-dev \
    && apk add --no-cache \
        bash \
        postgresql-client \
    && python -m ensurepip --upgrade \
    && pip install --no-cache --upgrade pip setuptools

# Copy requirements and install
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir gunicorn

# Copy project files
COPY . /app/

# Create directories used at runtime
RUN mkdir -p /app/staticfiles /app/media /app/logs

# Expose application port
EXPOSE 8000

# Simple healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8000/ || exit 1

COPY ./entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
