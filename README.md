## Backend data pipeline

The backend now includes a first WeLoveDevs ingestion pipeline:

- manual import from WeLoveDevs;
- normalization to the internal `offers` table;
- MySQL upsert by external id;
- searchable offers endpoint;

See `docs/data-pipeline.md` for setup and demo commands.
