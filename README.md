# atlas-admin-portal
Admin dashboard for managers and staff to manage listings, bookings, guests, and incidents

## API configuration

Create a `.env.local` file and set `VITE_API_BASE_URL` to the base URL of the Atlas API. If this variable is omitted the app will default to `http://localhost:7071/api` for local development. The reports page fetches data from REST endpoints such as:

```
GET /admin/reports/earnings/monthly
GET /admin/reports/payouts/daily
GET /admin/reports/bookings/calendar
```

If these endpoints are unavailable the application will automatically fall back
to the standard `/admin/reports/bookings`, `/admin/reports/listings` and
`/admin/reports/payouts` endpoints.

# Go to the directory where you want to store all repos
cd ~/Projects/AtlasHomestays  # or any preferred location

# Clone each repository
git clone https://github.com/sreekaratla81/atlas-guest-portal.git
git clone https://github.com/sreekaratla81/atlas-admin-portal.git
git clone https://github.com/sreekaratla81/atlas-api.git
git clone https://github.com/sreekaratla81/atlas-staff-app.git
git clone https://github.com/sreekaratla81/atlas-sql.git
git clone https://github.com/sreekaratla81/atlas-shared-utils.git

## Auth0 configuration

The application uses Auth0 for authentication. Configure the following variables in your `.env` file:

```
VITE_AUTH_BYPASS=false
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=xxxx
VITE_AUTH0_CALLBACK_PATH=/auth/callback
VITE_DEFAULT_AFTER_LOGIN=/bookings
```
Set `VITE_AUTH_BYPASS=true` in `.env.local` and create `public/auth-bypass.json`
with the desired user object to bypass Auth0 during local development.
