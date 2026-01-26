# HIMSOLS Frontend (Vite + React)

This is the HIMSOLS frontend app (tree listing + order form) built with Vite + React (TypeScript).

## Features
- View a list of trees
- Select a tree to buy
- Fill out an order form
- Place an order

## Setup
1. Install deps:
   - `npm install`
2. Configure env:
   - Copy `.env.example` → `.env`
   - Set:
     - `VITE_API_BASE_URL=https://himsols.onrender.com`
3. Run dev server:
   - `npm run dev`

## Vercel Deploy
Set this environment variable in Vercel Project Settings:
- `VITE_API_BASE_URL` = `https://himsols.onrender.com`

Then deploy normally (Vercel will run `npm run build` and serve `dist/`).
