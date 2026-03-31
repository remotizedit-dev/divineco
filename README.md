
# Divine.Co Premium Shoe Store

This is a premium e-commerce platform built with Next.js 15, Tailwind CSS, ShadCN UI, and Firebase.

## Deployment to Vercel

Follow these steps to deploy your application to Vercel:

### 1. Push to GitHub
Ensure your code is pushed to a GitHub, GitLab, or Bitbucket repository.

### 2. Import to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New"** > **"Project"**.
3. Import your repository.

### 3. Build Settings
Vercel should automatically detect Next.js. The default settings are:
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

*Note: Your Firebase public configuration is already included in `src/firebase/config.ts`, so client-side Firestore and Auth will work automatically.*

### 4. Deploy
Click **"Deploy"**. Once finished, Vercel will provide you with a production URL.

## Local Development

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:9002`.

## Project Structure

- `src/app/(public)`: Storefront pages (Home, Products, Checkout).
- `src/app/control-panel`: Administrative dashboard for inventory and orders.
- `src/firebase`: Firebase configuration and custom hooks for Firestore/Auth.
