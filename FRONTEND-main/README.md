# Horbax Frontend

Next.js frontend for the Horbax laundry management app.

## Structure

```text
src/
  app/
    layout.tsx
    page.tsx
    login/page.tsx
    (protected)/
      layout.tsx
      dashboard/page.tsx
      new-order/page.tsx
      pending/page.tsx
      history/page.tsx
      collection/page.tsx
      expenses/page.tsx
      settings/page.tsx
  views/        # UI screens
  components/   # shared UI and route protection
  context/      # auth state
  api/          # axios client
  types/        # TypeScript types
```

## Scripts

- `npm run dev` starts the local development server.
- `npm run build` creates a production build.
- `npm run start` serves the production build.

Set `NEXT_PUBLIC_API_URL` if the backend API is not running at `http://localhost:5000/api`.
