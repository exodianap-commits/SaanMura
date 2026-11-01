# SaanMura Web Dashboard — Production Deployment Guide

This guide details how to build and deploy the **SaanMura Administration & Verifier Dashboard** (`apps/web`) to production cloud hosting platforms (Vercel, Netlify, Cloudflare Pages, or Docker / NGINX).

---

## 1. Production Build Verification

From the monorepo root:
```bash
# 1. Build all shared workspace dependencies
pnpm build:packages

# 2. Build the web app with Vite and TypeScript
pnpm build:web
```
The output is bundled into `apps/web/dist/`:
- `index.html`
- `assets/index-[hash].css`
- `assets/index-[hash].js`

---

## 2. Deploying to Vercel (Recommended)

### Step 2.1: Vercel Project Settings
- **Root Directory**: `apps/web`
- **Build Command**: `cd ../.. && pnpm build:packages && cd apps/web && pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

### Step 2.2: Environment Variables
Configure in Vercel Dashboard -> Settings -> Environment Variables:
```ini
VITE_SUPABASE_URL=https://your-production.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### Step 2.3: SPA Routing (`vercel.json`)
Inside `apps/web/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 3. Deploying with Docker & NGINX (Self-Hosted / Government Cloud)

Create `apps/web/Dockerfile`:
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/web ./apps/web
RUN pnpm install --frozen-lockfile
RUN pnpm build:packages
RUN pnpm build:web

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 4. Database Migration Execution on Production

Apply migrations to your live Supabase project:
```bash
# Link your production Supabase project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Apply seed data (if setting up initial staging)
supabase db reset
```
