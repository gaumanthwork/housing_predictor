# Haven Property Portal

Unified Next.js App Router portal for the Python property estimator and Java market-analysis application.

## Getting Started

From the repository root, start the FastAPI and Spring Boot services:

```bash
docker compose up --build
```

If a default port is occupied, override it with `FASTAPI_PORT=18000` or `JAVA_PORT=18080` before `docker compose up` and set the matching frontend URL.

Then start the portal:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000). The estimator uses `FASTAPI_URL` and the market dashboard uses `JAVA_API_URL`; their defaults match the Compose ports.

The market page performs initial loading in its React Server Component. Interactive CRUD and what-if requests are sent through constrained Next.js Route Handlers.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
