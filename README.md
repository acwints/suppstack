This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# SuppStack

SuppStack is a supplement tracking application that allows users to monitor their supplement intake and analyze their data.

## Features

- Track your daily supplement intake
- Discover popular supplements
- Analyze your supplement data
- User authentication with Google
- Browse a catalog-backed supplement database when Supabase data is sparse
- Compare products by serving cost, monthly cost, dosage context, and merchant channel
- Prefer Shopify-ready checkout paths with official-store and Amazon fallbacks

## Commerce Architecture

SuppStack keeps supplement discovery, product comparison, and purchasing as separate layers:

- `src/lib/catalog/supplement-catalog.ts` provides the universal supplement database and generated product offers for catalog gaps.
- `src/lib/commerce/shopify-ucp.ts` resolves the preferred purchase path for every product, prioritizing Shopify/UCP metadata before official-store or Amazon URLs.
- The Shopify/UCP product, variant, store, checkout, stock, badge, and subscription columns live in migration `supabase/migrations/20260101000002_commerce.sql`.
- UI components use the same card, badge, button, and pricing language across discovery, supplement detail, product detail, and stack checkout.

Shopify UCP checkout requires merchant capability discovery and authenticated/signed checkout access. Until those credentials are connected, SuppStack stores UCP-ready metadata and hands shoppers to Shopify product discovery or merchant checkout URLs.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your environment variables (see `.env.example`)
4. Apply the database schema: run the migrations in `supabase/migrations/` in order (see `supabase/migrations/README.md`)
5. Run the development server: `npm run dev`

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
