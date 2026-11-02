# Extract Transform Load

This ETL pipeline manages provisioning a postgres database for the app, a Makefile facilitates all relevant commands.

## Quick Start
```bash
# provision a database from scratch, fetching anything that is required
make .venv create-db ingest

# review database
make docker-pg-shell
```
