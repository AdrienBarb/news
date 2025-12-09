#!/bin/bash

# Import Production Database to Local
# This script exports the production database and imports it into the local database

set -e  # Exit on error

echo "🔄 Starting production database import..."

# Read database URLs from .env files
PROD_DB_URL=$(grep DIRECT_URL .env.prod | cut -d '=' -f2 | tr -d '"')
LOCAL_DB_USER="postgres"
LOCAL_DB_PASSWORD="postgres"
LOCAL_DB_HOST="127.0.0.1"
LOCAL_DB_PORT="54325"
LOCAL_DB_NAME="postgres"

# Temporary file names
DUMP_FILE="prod_dump_temp.sql"
DATA_FILE="prod_data_temp.sql"

echo "📦 Exporting production database schema..."
supabase db dump --db-url "$PROD_DB_URL" -f "$DUMP_FILE"

echo "📦 Exporting production database data..."
supabase db dump --db-url "$PROD_DB_URL" --data-only -f "$DATA_FILE"

echo "🧹 Cleaning local database..."
PGPASSWORD="$LOCAL_DB_PASSWORD" psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "📥 Importing schema..."
PGPASSWORD="$LOCAL_DB_PASSWORD" psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" < "$DUMP_FILE"

echo "📥 Importing data..."
PGPASSWORD="$LOCAL_DB_PASSWORD" psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" < "$DATA_FILE"

echo "🧹 Cleaning up temporary files..."
rm "$DUMP_FILE" "$DATA_FILE"

echo "✅ Production database successfully imported to local!"
