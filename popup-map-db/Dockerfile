FROM postgres:16-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-16-postgis-3 \
        postgresql-16-postgis-3-scripts \
    && rm -rf /var/lib/apt/lists/*

COPY initdb/01-init-postgis.sh /docker-entrypoint-initdb.d/01-init-postgis.sh

RUN chmod +x /docker-entrypoint-initdb.d/01-init-postgis.sh
