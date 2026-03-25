# Deployment Configuration

This document outlines the configuration for deploying the CV Website application.

## Overview
- **Database**: MySQL on Railway
- **Backend**: Node.js on Render
- **Frontend**: Served statically by the backend

## Database Configuration (Railway)
1. Create a MySQL database on Railway.
2. Note the `DATABASE_URL` provided by Railway (e.g., `mysql://user:pass@host:port/db`).
3. Run the SQL schema from `MYSQL_SCHEMA.md` or `cvs (2).sql` to create tables.

## Backend Configuration (Render)
Use the following `render.yaml` for Render Blueprint deployment:

```yaml
services:
  - type: web
    name: cv-website-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false  # Set manually in Render dashboard with Railway DB URL
```

### Environment Variables
Set the following in Render:
- `DATABASE_URL`: The full connection string from Railway
- `NODE_ENV`: `production`

## Deployment Steps
1. Deploy MySQL on Railway and get `DATABASE_URL`.
2. Run database schema on Railway.
3. Create Render Blueprint from GitHub repo using `render.yaml`.
4. Set environment variables in Render.
5. Deploy and verify.

## Local Development
For local testing, create a `.env` file in `backend/` with:
```
DATABASE_URL=mysql://user:pass@localhost:3306/astoncv
```
Or individual vars:
```
DB_HOST=localhost
DB_USER=youruser
DB_PASS=yourpass
DB_NAME=astoncv
DB_PORT=3306
```