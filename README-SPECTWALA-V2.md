# Spectwala V2 — Role-based marketplace

This V2 reorganises Spectwala into a public luxury website plus separate Customer, Optical Store Owner, Wholesaler and Eye Camp experiences.

## Important

1. Do NOT upload `.env` or `.env.local` to GitHub.
2. This patch adds a Prisma migration for `WHOLESALER`, `EYE_CAMP`, wholesale stores/products/orders and eye-camp posts.
3. Payment is intentionally still COD / deferred.
4. Run Prisma migration + generate before building.

## Local setup

```bash
npx prisma migrate deploy
npx prisma generate
npm run build
```

Then:

```bash
npm run dev -- --webpack
```

## GitHub

```bash
git status
git add .
git commit -m "feat: Spectwala V2 role based marketplace"
git push origin main
```

## Vercel

Because the new Prisma migration must reach the production database, run:

```bash
npx prisma migrate deploy
npx prisma generate
```

against the production database before testing the new roles. Then deploy the GitHub commit.

## New role flow

- Customer: Google login → `/shop`
- Optical Store Owner: registration → admin approval → Google login → `/store-setup` → `/seller`
- Wholesaler: registration → admin approval → Google login → `/wholesale`
- Eye Camp: registration → admin approval → Google login → `/eye-camp`

Customers never receive the wholesale directory or wholesale catalogue.
