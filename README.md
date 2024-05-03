# VSRun App

A react project that highlights my runs, shoes, and races.

Demo: [https://vsrun-app.vercel.app](https://vsrun-app.vercel.app)

# Requirements

- Node 18
- Postgres
- React 18

# Setup

1. Install dependencies
   `yarn install`

2. Setup postgres database and update .env **DATABASE_URL**

3. Create Strava app and update .env **STRAVA_CLIENT_ID** and **STRAVA_CLIENT_SECRET**
   On Strava api settings, specify callback domain with `localhost:3000`

4. Push db schema
   `yarn prisma db push`

5. Run server
   `yarn dev`
