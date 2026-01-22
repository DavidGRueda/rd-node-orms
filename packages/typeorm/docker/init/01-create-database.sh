#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE movies_typeorm;

  GRANT ALL PRIVILEGES ON DATABASE movies_typeorm TO $POSTGRES_USER;
EOSQL

