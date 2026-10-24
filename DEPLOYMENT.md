# Deployment Guide: GitHub & Cloudflare Pages for AIOSTREAM

This guide provides step-by-step instructions for deploying **AIOSTREAM** to Cloudflare Pages directly from a GitHub repository.

---

## 1. Push the Project to GitHub

1. Initialize git in your local directory (if not already initialized):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AIOSTREAM Ad-Free Video Streaming App"
   ```

2. Create a new repository on [GitHub](https://github.com/new) named `aiostream`.

3. Link your local project to the GitHub remote and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-github-username>/aiostream.git
   git push -u origin main
   ```

---

## 2. Connect the Repository to Cloudflare Pages

1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** in the left sidebar.
3. Click **Create Application**, then switch to the **Pages** tab.
4. Click **Connect to Git**.
5. Select your GitHub account and choose the `aiostream` repository.
6. Click **Begin setup**.

---

## 3. Configure the Vite Build Settings

In the Cloudflare Pages build configuration screen:

- **Project name**: `aiostream` (or your chosen name)
- **Production branch**: `main`
- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave empty or set to `/`)

---

## 4. Add Environment Variables (Optional)

In the **Environment variables (advanced)** section of the Cloudflare Pages setup:

| Variable Name | Description | Example Value |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public API key | `eyJhbGciOi...` |
| `NODE_VERSION` | Node.js runtime version | `20` |

*(Note: If you leave `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` blank, AIOSTREAM will seamlessly use browser localStorage, and users can connect their Supabase account via the in-app settings modal at any time.)*

---

## 5. Deploy & Verify

1. Click **Save and Deploy**.
2. Cloudflare Pages will clone the GitHub repository, run `npm install`, execute `npm run build`, and publish your application on a global edge network.
3. Once the build completes (usually under 60 seconds), Cloudflare will provide your live deployment URL (e.g. `https://aiostream.pages.dev`).
4. Test the site:
   - Paste any YouTube link to ensure direct streaming functions without ads.
   - Test playback of 4K open cinema streams.
   - Test downloading a video to ensure the download manager records and completes the file.
   - Create a playlist and add videos.

---

## 6. Connect a Custom Domain

1. In your Cloudflare Pages project dashboard, open the **Custom domains** tab.
2. Click **Set up a custom domain**.
3. Enter your domain or subdomain (e.g., `stream.yourdomain.com`).
4. If your domain is already managed by Cloudflare, DNS records are configured automatically. If using an external registrar (e.g., Namecheap, GoDaddy), create a `CNAME` record pointing to `aiostream.pages.dev`.
5. Cloudflare automatically provisions and renews a free Universal SSL certificate.

---

## 7. Troubleshooting Common Errors

### Error: `Page not found (404)` on page refresh
- **Cause**: In single-page applications (SPAs), routes like `/categories` need to resolve to `index.html`.
- **Solution**: The included `public/_headers` file handles caching and redirects for Cloudflare Pages. Cloudflare Pages automatically serves `index.html` for single-page application routes when the Vite preset is selected.

### Error: `Supabase connection failed: Invalid API key`
- **Cause**: The key entered is either the private `service_role` key or is formatted incorrectly.
- **Solution**: In Supabase, navigate to **Project Settings > API**, and copy the public **anon** key. Never use the `service_role` secret in frontend applications.

### Error: `Build failed: tsc error`
- **Cause**: Type check failure during build.
- **Solution**: Run `npm run lint` or `npm run build` locally before pushing to GitHub to catch any TypeScript errors.
