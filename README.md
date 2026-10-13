# AutoRia Clone

A car-sale listings platform (an AutoRia clone), built as the Okten Node.js final project.

- **app/**: REST API. Node.js, Express 5, TypeScript, MongoDB (Mongoose), Zod
- **web/**: React 19 + Vite + Tailwind frontend, served by nginx in Docker
- **docker-compose.yml**: runs the API, frontend and MongoDB together

## Features

- **Roles and permissions**: `buyer`, `seller`, `manager`, `administrator`. Every role maps to a list of permissions (`app/src/features/user/enums/role.enum.ts`), and endpoints check permissions instead of roles.
- **Dealerships (tenants)**: a dealership signs up with its own administrator. Its staff only see and manage users and notices inside that dealership. Staff without a tenant are platform staff and can act on anyone.
- **Accounts**: basic accounts can have **one** notice. Premium accounts get unlimited notices plus statistics: views per day, week and month, and average prices in the region and across the country.
- **Notices**: a car brand and model must exist in the catalog. Prices can be entered in UAH, USD or EUR and are converted to all three currencies using PrivatBank rates, which a cron job refreshes every day at 00:10.
- **Profanity check**: a description with profanity puts the notice in the `pending` status. After 3 failed edits it becomes `inactive`, and platform managers get an email.
- **Catalog**: brands and models live in the DB, and the default brands are seeded on startup. Users can report a missing brand or model, which emails the administrators.
- **Auth**: JWT access and refresh tokens are stored in the DB. Refresh tokens can only be used once. Expired tokens are removed by a TTL index. Auth endpoints are rate limited to 20 requests per 15 minutes.
- **Emails**: sent through Gmail (nodemailer) using Handlebars templates.

## Getting started

### Environment

Create `app/.env`:

```env
MONGO_URI=mongodb://admin:verysecretpassword@localhost:27017/database?authSource=admin
PORT=12250
FRONTEND_URL=http://localhost:5173

JWT_ACCESS_SECRET=some-access-secret
JWT_REFRESH_SECRET=some-refresh-secret

# lifetimes are in milliseconds
# 10 minutes
JWT_ACCESS_LIFETIME=600000
# 30 days
JWT_REFRESH_LIFETIME=2592000000

# Gmail account + app password
EMAIL_USERNAME=you@gmail.com
EMAIL_PASSWORD=your-app-password
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGO_URI` | yes | – | MongoDB connection string |
| `PORT` | no | `12250` | API port |
| `TRUST_PROXY` | no | `0` | Number of reverse proxies in front of the API (`1` behind nginx) |
| `FRONTEND_URL` | no | `http://localhost:5173` | Allowed CORS origin |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | yes | – | Token secrets |
| `JWT_ACCESS_LIFETIME` / `JWT_REFRESH_LIFETIME` | yes | – | Token lifetimes in **milliseconds** |
| `EMAIL_USERNAME` / `EMAIL_PASSWORD` | yes | – | Gmail sender credentials |

### Docker (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:5173 (nginx proxies `/api/*` to the API)
- API: http://localhost:12250 (bound to localhost, for Postman)
- MongoDB: `localhost:27017`, user `admin` / `verysecretpassword`

### Local development

```bash
docker compose up database   # or use your own MongoDB
cd app
npm install
npm run dev                  # tsc-watch + node dist/main.js
```

| Script | Description |
|---|---|
| `npm run dev` | Compile in watch mode and restart on changes |
| `npm run build` / `npm start` | Production build / run |
| `npm run lint` / `npm run lint:fix` | ESLint + Prettier |
| `npm run typecheck` | `tsc --noEmit` |

### First platform administrator

No endpoint creates a platform administrator, because that would let anyone become one. Register a normal user first, then promote that user in MongoDB:

```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "administrator", tenant: null } })
```

## API

Base URL: `http://localhost:12250`. Protected endpoints need `Authorization: Bearer <accessToken>`.

A ready-made Postman collection is in `AutoRia.postman_collection.json`. Import it, then run **Auth → Sign in**: the access token, refresh token and user id are saved to collection variables automatically.

Errors have the shape `{ "status": 400, "message": "..." }`. Paginated lists take `?page=1&limit=20` (max `limit` is 100) and return `{ data, page, limit, total }`.

### Auth: `/auth`

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/auth/sign-up` | – | `{ name, email, password }` |
| POST | `/auth/sign-up-dealer` | – | `{ name, email, password, tenant }`: creates a dealership and its administrator |
| POST | `/auth/sign-in` | – | `{ email, password }` → `{ user, tokens }` |
| POST | `/auth/refresh` | – | `{ refreshToken }` → new token pair |
| POST | `/auth/sign-out` | ✔ | – |
| POST | `/auth/sign-out-all` | ✔ | – |
| GET | `/auth/me` | ✔ | – |

### Users: `/users`

| Method | Path | Who | Body |
|---|---|---|---|
| GET | `/users` | manager, admin | pagination query |
| GET | `/users/:id` | anyone | – |
| PUT | `/users/:id` | self | `{ name?, email? }` |
| POST | `/users/premium/purchase` | self | `{ cardHolder, cardNumber, expiry: "MM/YY", cvv }` (dummy payment) |
| PATCH | `/users/:id/give-premium` | platform admin | – |
| POST | `/users/tenant/request` | user without a tenant | `{ tenant }` |
| PATCH | `/users/:id/tenant/make` | tenant manager/admin | – (accepts the join request) |
| PATCH | `/users/:id/tenant/remove` | manager, admin | – |
| PATCH | `/users/:id/promote/seller` | self or admin | – |
| PATCH | `/users/:id/promote/manager` | admin | – |
| PATCH | `/users/:id/demote` | admin | – |
| PATCH | `/users/:id/ban` / `/unban` | manager, admin | – |
| DELETE | `/users/:id` | self or admin | – |

Dummy payment: any valid 16-digit card that passes the Luhn check, e.g. `4242 4242 4242 4242`, is accepted. `4000000000000002` is always declined.

### Notices: `/notice`

| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/notice` | anyone | Active notices. Query: `brand`, `model`, `region`, pagination |
| GET | `/notice/region/:region` | anyone | Active notices in a region |
| GET | `/notice/id/:id` | anyone | Public view with seller contacts. **Counts as a view** |
| GET | `/notice/my` | ✔ | Own notices, any status |
| GET | `/notice/manage/:id` | owner, staff | Any status, not counted as a view |
| GET | `/notice/moderation` | manager, admin | Query: `status=pending\|inactive` |
| GET | `/notice/premium/stats/:id` | premium owner | Views + average prices |
| GET | `/notice/premium/views/:id` | premium owner | Views for the day, week and month |
| GET | `/notice/premium/prices` | premium | Query: `model`, `region`, `brand?` |
| POST | `/notice` | seller+ | `{ brand, model, region, description, price, currency }` |
| PUT | `/notice/:id` | owner, staff | `{ brand?, model?, region?, price?, currency? }` (send `model` when changing `brand`) |
| PATCH | `/notice/:id` | owner, staff | `{ description }` (goes through the profanity check) |
| PATCH | `/notice/:id/activate` | manager, admin | Approves a pending or inactive notice |
| DELETE | `/notice/:id` | owner, staff | – |

`currency`: `uah`, `usd` or `eur`. `region`: e.g. `kyiv`, `kyiv-city`, `lviv`, `odesa`, `kharkiv` (see `app/src/features/notice/enums/regions.enum.ts`).

### Catalog: `/notice/catalog`

| Method | Path | Who | Body |
|---|---|---|---|
| GET | `/notice/catalog/brands` | anyone | – |
| GET | `/notice/catalog/brands/:brand/models` | anyone | – |
| POST | `/notice/catalog/brands` | platform admin | `{ brand: "honda", name: "Honda" }` |
| POST | `/notice/catalog/brands/:brand/models` | platform admin | `{ model }` |
| POST | `/notice/catalog/report-missing` | ✔ | `{ brand, model? }` |

## Project structure

```
app/src
├── cron/            daily exchange-rate refresh + price recalculation
├── db/              mongoose connection
├── enums/           permissions, status codes
├── env/             zod-validated env
├── features/
│   ├── api/         root router, error class, validation middleware, pagination
│   ├── email/       nodemailer service + handlebars templates
│   ├── notice/      notices + catalog (brand, model), currency, views
│   ├── token/       JWT generation, storage
│   └── user/        users + auth
├── utils/           permission checks, profanity matcher
└── main.ts
```
