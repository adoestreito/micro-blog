# Storage Room Inventory

A one-screen personal inventory app for tracking what is in a storage room.

The frontend is static and Vercel-friendly. Persistence goes through a Vercel serverless API route, which writes to Supabase using a server-side service role key.

## Features

- Add, edit, and remove inventory rows on one screen
- Track item name, quantity, optional description, optional expiration date, and optional location
- Save the full edited list back to Supabase
- Optional app password for personal use
- No frontend build step or client-side Supabase secret

## Project structure

- `index.html` - inventory UI
- `css/style.css` - app styles
- `api/items.js` - Vercel API route for listing and saving items
- `supabase/schema.sql` - Supabase table and trigger setup
- `.env.example` - required environment variables

## Supabase setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `supabase/schema.sql`.

The schema enables row level security and does not create public policies. The Vercel API uses the service role key server-side, so browser users never receive database credentials.

## Vercel setup

Set these environment variables in Vercel:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
INVENTORY_APP_PASSWORD=choose-a-private-password
```

`INVENTORY_APP_PASSWORD` is optional, but recommended. If it is set, the app asks for this password before loading or saving inventory data.

Deploy the repository to Vercel as a static app with serverless functions. No build command is required.

## Run locally

Install the Vercel CLI if needed:

```bash
npm install -g vercel
```

Create a local environment file from the example:

```bash
cp .env.example .env.local
```

Then fill in your Supabase values and run:

```bash
vercel dev
```
