# TrustVest

TrustVest is a premium, dark-themed fintech investment platform built with:

- Frontend: Next.js + Tailwind CSS + Framer Motion
- Backend: Node.js + Express + MongoDB Atlas + JWT auth

It includes secure auth flows, wallet operations, manual UPI QR deposits, level-based investments, referral income, KYC upload, admin approvals, notifications, and transaction history.

## Folder Structure

```text
trustvest/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/kyc/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── (auth)/login
│   │   ├── (auth)/register
│   │   ├── admin
│   │   ├── dashboard
│   │   ├── globals.css
│   │   ├── layout.jsx
│   │   └── page.jsx
│   ├── components/
│   │   ├── dashboard/
│   │   ├── home/
│   │   └── ui/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── .env.example
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

## Key Features Implemented

1. User register/login with JWT
2. Password hashing with `bcryptjs`
3. Protected API routes and admin-only routes
4. Wallet summary with manual deposit and withdrawals
5. Investment plans + invest endpoint
6. Level system (₹300 start, ₹200 increments, 5 levels)
7. Daily income simulation logic (up to 60%)
8. Referral income payouts
9. Transaction history
10. KYC upload and review flow
11. Notification system (user + broadcast/admin)
12. Live stats endpoint and animated ticker
13. Admin dashboard for approvals and analytics
14. Manual UPI QR deposit workflow with screenshot + UTR verification
15. Duplicate UTR protection and secure image upload validation
16. Admin payment settings (UPI ID, QR, enable/disable deposits)

## Investment Level Logic

- Level 1: ₹300
- Level 2: ₹500
- Level 3: ₹700
- Level 4: ₹900
- Level 5: ₹1100

## Environment Variables

### Backend (`backend/.env`)

Use `backend/.env.example` as template:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/trustvest?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=admin@trustvest.com
ADMIN_PASSWORD=Admin@123456
```

### Frontend (`frontend/.env.local`)

Use `frontend/.env.example` as template:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create env files:

- `backend/.env`
- `frontend/.env.local`

3. Run both apps:

```bash
npm run dev
```

4. Open:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## API Overview

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Wallet

- `GET /api/v1/wallet/summary`
- `GET /api/v1/wallet/payment-settings`
- `GET /api/v1/wallet/deposits/my`
- `POST /api/v1/wallet/deposit` (multipart: `amount`, `utr`, `screenshot`)
- `POST /api/v1/wallet/withdraw`
- `GET /api/v1/wallet/transactions`

### Investments

- `GET /api/v1/investments/plans`
- `GET /api/v1/investments/levels`
- `GET /api/v1/investments/calculator`
- `GET /api/v1/investments/my`
- `POST /api/v1/investments/invest`

### KYC

- `POST /api/v1/kyc/upload`

### Notifications

- `GET /api/v1/notifications`
- `PATCH /api/v1/notifications/:id/read`

### Public

- `GET /api/v1/public/live-stats`

### Admin

- `GET /api/v1/admin/analytics`
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/transactions/pending`
- `GET /api/v1/admin/deposits?status=pending`
- `PATCH /api/v1/admin/deposits/:id/decision`
- `GET /api/v1/admin/payment-settings`
- `PATCH /api/v1/admin/payment-settings`
- `PATCH /api/v1/admin/payment-settings/qr` (multipart: `qrImage`)
- `PATCH /api/v1/admin/transactions/:id/decision`
- `PATCH /api/v1/admin/kyc/:userId`
- `POST /api/v1/admin/notifications`

## Security Controls Included

- Helmet headers
- Request rate limiting
- Mongo sanitize + HPP
- CORS protection
- Password hashing
- JWT middleware
- Role-based authorization
- Server-side validation via `express-validator`
- Multer image validation with file size limits
- Duplicate UTR prevention via indexed normalized UTR

## Deployment

### Option A: Frontend on Vercel, Backend on Render/Railway

1. Deploy backend service:
- Set root to `backend`
- Add backend env vars
- Ensure MongoDB Atlas network access allows your backend host

2. Deploy frontend on Vercel:
- Set root to `frontend`
- Add `NEXT_PUBLIC_API_URL` pointing to deployed backend URL

3. Update backend `CLIENT_URL` to your frontend production URL.

### Option B: Single VPS (Nginx + PM2)

1. Build frontend: `npm run build --workspace frontend`
2. Start backend with PM2: `npm run start --workspace backend`
3. Start frontend with PM2: `npm run start --workspace frontend`
4. Reverse-proxy both through Nginx with SSL.

## Notes

- Default plans/admin are auto-seeded on backend startup.
- Uploaded files are stored locally in `backend/uploads` (`kyc`, `deposits`, `payment-settings`). Replace with Cloudinary/S3 in production.
- `next build` was run successfully for compile validation.
