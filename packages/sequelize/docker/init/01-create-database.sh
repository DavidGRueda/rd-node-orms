#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE movies_sequelize;

  GRANT ALL PRIVILEGES ON DATABASE movies_sequelize TO $POSTGRES_USER;
EOSQL

