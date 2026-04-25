#!/bin/bash
set -euo pipefail

psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'SQL'
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
SQL
