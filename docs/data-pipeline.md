# Data Pipeline For The Team

This document explains our first data version.

The goal is simple:

```text
WeLoveDevs API -> normalize offers -> save in MySQL -> give data to the frontend
```

For now, we do not manage admin roles, JWT, security rules, AI or automatic jobs in this part. This first version only creates a clean database that the rest of the project can use and improve later.

## What This Part Does

It can:

- call the WeLoveDevs API;
- receive real job offers;
- convert external offers to our own format;
- save offers in the `offers` table;
- update existing offers instead of creating duplicates;
- expose saved offers through our backend API.

## Main Files

`backend/src/services/welovedevsClient.js`

Calls the WeLoveDevs API. It uses `WELOVEDEVS_API_KEY` from `.env`.

`backend/src/utils/normalize.js`

Converts one raw WeLoveDevs offer into our internal offer format.

`backend/src/services/offerIngestionService.js`

Runs the full import flow: fetch offers, normalize them, save them in MySQL.

`backend/src/controllers/ingestionController.js`

Receives the HTTP request that starts an import.

`backend/src/controllers/offersController.js`

Reads saved offers from our database for the frontend.

`backend/sql/init.sql`

Creates the database tables.

`docker-compose.yml`

Starts the MySQL database.

## Create The `.env` File

The backend needs environment variables. They are stored in `backend/.env`.

This file is not committed to Git because it can contain secrets like API keys.

Create it from the example file:

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and set your WeLoveDevs key:

```bash
WELOVEDEVS_API_KEY=your_api_key
WELOVEDEVS_API_URL=https://epi-api.welovedevs.com
```

Keep the database values like this for Docker Compose:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=job_aggregator
```

## Start The Database

Start MySQL with Docker Compose:

```bash
docker compose up -d database
```

The `backend/sql/init.sql` file is mounted into the container. On the first start, it creates the `job_aggregator` database with the `users` and `offers` tables.

## Start The Backend

Install dependencies and run the backend:

```bash
cd backend
npm install
npm run dev
```

Keep this terminal open. The backend must stay running for `curl http://localhost:4000/...` commands to work.

The backend runs on:

```text
http://localhost:4000
```

You can quickly check that the backend is alive:

```bash
curl http://localhost:4000/ping
```

Expected response:

```json
{"status":"ok"}
```

## Import Offers

Use this request:

```bash
curl -X POST http://localhost:4000/api/ingestion/welovedevs \
  -H "Content-Type: application/json" \
  -d '{"q":"node","size":5}'
```

Meaning:

- `q`: search keyword sent to WeLoveDevs;
- `size`: number of offers to import;
- `page`: optional page number, default is `0`.

Example with page:

```bash
curl -X POST http://localhost:4000/api/ingestion/welovedevs \
  -H "Content-Type: application/json" \
  -d '{"q":"react","size":10,"page":0}'
```

## Read Offers

Read all latest offers:

```bash
curl http://localhost:4000/api/offers
```

Search offers:

```bash
curl "http://localhost:4000/api/offers?q=node"
```

Filter by location:

```bash
curl "http://localhost:4000/api/offers?location=Paris"
```

Filter by contract type:

```bash
curl "http://localhost:4000/api/offers?contract_type=CDI"
```

## Check The Database

Open MySQL inside Docker:

```bash
docker compose exec database mysql --default-character-set=utf8mb4 -u root
```

Then run:

```sql
USE job_aggregator;
SELECT id, title, company, location, contract_type FROM offers LIMIT 10;
```

You can also use one command:

```bash
docker compose exec database mysql --default-character-set=utf8mb4 -u root -e "USE job_aggregator; SELECT id, title, company, location FROM offers LIMIT 10;"
```

## What Is Saved In `offers`

Each saved offer has:

- `external_id`: id from WeLoveDevs;
- `source`: currently `welovedevs`;
- `title`;
- `description`;
- `company`;
- `location`;
- `contract_type`;
- `salary`;
- `remote`;
- `apply_url`;
- `published_at`;
- `raw_payload`: original JSON from WeLoveDevs.

`external_id` is unique. This is important because it prevents duplicates. If we import the same offer again, MySQL updates the existing row.

## Command Checklist

Use this full list when you want to test the data pipeline from zero.

Create `.env`:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your key:

```bash
WELOVEDEVS_API_KEY=your_api_key
```

Start the database:

```bash
docker compose up -d database
```

Install backend dependencies:

```bash
cd backend
npm install
```

Run the backend:

```bash
cd backend
npm run dev
```

Keep this command running. Open another terminal for the next commands.

Check backend health:

```bash
curl http://localhost:4000/ping
```

Import offers:

```bash
curl -X POST http://localhost:4000/api/ingestion/welovedevs \
  -H "Content-Type: application/json" \
  -d '{"q":"node","size":5}'
```

Read offers from the API:

```bash
curl "http://localhost:4000/api/offers?q=node"
```

Check offers in MySQL:

```bash
docker compose exec database mysql --default-character-set=utf8mb4 -u root -e "USE job_aggregator; SELECT id, title, company, location FROM offers LIMIT 10;"
```

Run tests:

```bash
cd backend
npm test
```

Run lint:

```bash
cd backend
npm run lint
```

## Common Problems

If the backend says `WELOVEDEVS_API_KEY is missing`, check `backend/.env`.

If the database is not running, start it again:

```bash
docker compose up -d database
```

If `curl http://localhost:4000/api/offers` says it cannot connect, the backend is not running. Start it in another terminal:

```bash
cd backend
npm run dev
```

Then test:

```bash
curl http://localhost:4000/ping
```

If accented characters look broken in the terminal, use:

```bash
--default-character-set=utf8mb4
```

The data in the backend API is still valid UTF-8.
