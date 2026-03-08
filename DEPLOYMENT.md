# ProsperAI - Deployment Guide (Supabase Postgres)

Production deployment steps for ProsperAI with **Supabase PostgreSQL** as the database.

## Architecture Overview

- **Database**: Supabase PostgreSQL
- **Backend**: AWS Elastic Beanstalk (Node.js) or EC2 (PM2)
- **Frontend**: S3 + CloudFront
- **Secrets**: AWS Secrets Manager or Parameter Store

---

## 1. Supabase PostgreSQL Setup

1. Create a Supabase project.
2. In Supabase, open **SQL Editor** and run `backend/src/db/schema.sql`.
3. Store the Supabase `DATABASE_URL` in AWS Secrets Manager / Parameter Store.

---

## 2. Backend Deployment (AWS Elastic Beanstalk - Node.js)

1. Create an Elastic Beanstalk application and environment (Node.js).
2. Configure environment variables:
   - `DATABASE_URL` (Supabase connection string)
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
   - `FRONTEND_URL` (your CloudFront domain)
3. Deploy the backend by uploading the `backend/` folder (as a zip) via the EB console/CLI.

Notes:
- If you deploy to a serverless environment, use the Supabase **Transaction pooler** connection string.
- Ensure your backend can reach Supabase (outbound HTTPS/TCP allowed).

---

## 3. Frontend Deployment (S3 + CloudFront)

### Build Frontend

```bash
cd frontend

# Set API base URL (or use env at build time)
# Vite: VITE_API_URL=https://api.yourdomain.com npm run build
npm run build
```

### S3 Bucket

1. Create S3 bucket: `prosperai-frontend`
2. Enable static website hosting
3. Set bucket policy for CloudFront OAI
4. Upload `dist/` contents:
   ```bash
   aws s3 sync dist/ s3://prosperai-frontend/ --delete
   ```

### CloudFront Distribution

1. Create distribution
2. Origin: S3 bucket
3. Default root object: `index.html`
4. Error pages: 404 → `/index.html` (for SPA routing)
5. Custom domain (optional): `app.yourdomain.com`
6. SSL: ACM certificate

---

## 4. Environment Variables

| Variable      | Source                 |
|---------------|------------------------|
| DATABASE_URL  | Secrets Manager        |
| JWT_SECRET    | Secrets Manager        |
| OPENAI_API_KEY| Secrets Manager        |
| FRONTEND_URL  | CloudFront URL         |

---

## 5. CORS & Security

- Set `FRONTEND_URL` to your CloudFront domain (e.g. `https://app.prosperai.com`)
- Keep `DATABASE_URL` in Secrets Manager / Parameter Store (do not commit it)
- Enable VPC Flow Logs
- Use WAF on CloudFront for DDoS protection

---

## 6. CI/CD (Optional - GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: cd backend && npm ci && npm run build
      # Deploy step depends on your hosting (Elastic Beanstalk, EC2, etc.)
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: cd frontend && npm ci && npm run build
      - uses: aws-actions/configure-aws-credentials@v4
      - run: aws s3 sync frontend/dist/ s3://prosperai-frontend/ --delete
```

---

## 7. Quick Commands

```bash
# Backend (uses Supabase DATABASE_URL)
cd backend && npm run dev

# Frontend dev (proxy to backend)
cd frontend && npm run dev
```
