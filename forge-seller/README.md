# Sartoria Seller (The Forge)

A Next.js + Supabase prototype for the Seller-facing Forge dashboard. Manufacturers upload front/back garment views and receive AI-powered 3D digital twins.

## Project Structure

- `app/` — Next.js App Router UI
- `components/` — Upload, product grid, and GLB viewer
- `lib/supabaseClient.ts` — Supabase browser client
- `supabase/migrations/001_init.sql` — Initial schema and RLS policies
- `ai-worker/` — Python FastAPI mock worker bridge

## Setup

1. Install frontend dependencies:

```bash
cd forge-seller
npm install
```

2. Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

3. Run the frontend:

```bash
npm run dev
```

4. Start the AI worker:

```bash
cd ai-worker
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Supabase Schema

The migration script creates:
- `profiles` (links to Supabase Auth user)
- `products` (seller jobs with status lifecycle)
- `assets` (front/back images, GLB link, metadata)

The schema enforces RLS so sellers only read and modify their own designs.

## Worker Endpoint

`POST /generate-3d`

Request body:

```json
{
  "product_id": "<uuid>",
  "front_image_url": "<signed-url>",
  "back_image_url": "<signed-url>"
}
```

The Python worker uploads a placeholder `.glb` to `digital-twins` and updates the product to `completed`.
