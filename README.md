
# Clickstream Collector (Vercel + MongoDB)

This project collects behavioral, temporal, device, and session features from users visiting the frontend page.
It is ready to deploy on Vercel and stores data in MongoDB Atlas.

## Features collected (client + server)
- Temporal: click timestamps, click intervals, session duration, clicks per minute, click frequency, active time ratio
- Behavioral: mouse movement count, path length, average speed (derivable), hover time, scroll count, scroll depth, click coordinates
- Device/Network (server): IP, geolocation (country), userAgent, browser, OS, device type
- Session/Traffic: sessionId, referrer, landingPage, pagesVisited (1), dwellTime, adImpressionCount, CTR
- Events array: raw event timeline (mousemove, click, scroll, visibility)

## Vercel Deployment
1. Push repo to GitHub.
2. Import project in Vercel (https://vercel.com).
3. In Vercel dashboard, set Environment Variable:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `MONGODB_DB` = database name (e.g., clickstreamdb)
4. Deploy. The API endpoint `/api/collect` will be used by the frontend to store data.


## Quick setup (Local) 
1. Copy `.env.example` to `.env` and set `MONGODB_URI` and `MONGODB_DB`.
2. Install dependencies:
   ```
   npm install
   ```
3. Run locally (Express server that mimics serverless):
   ```
   node server.js
   ```
4. Open `http://localhost:3000`

   
## Notes
- The serverless function `/api/collect` stores data to MongoDB.

