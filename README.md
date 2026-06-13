# QuickShow

QuickShow is a full-stack movie ticket booking application built with React, Vite, Express, MongoDB, Stripe, and Clerk. It lets users discover movies, view details, choose showtimes, select seats, complete payment, and manage favorites. It also includes an admin dashboard for managing shows, bookings, and analytics.

## Key Features

- Movie discovery and listings
- Now playing and popular movie details
- Seat layout selection with occupied seat tracking
- Stripe checkout integration for ticket payment
- User authentication and favorites using Clerk
- User booking history page
- Admin dashboard for shows, bookings, and metrics
- Show creation via TMDB movie metadata fetch
- Real-time seat availability checks
- Inngest background task to verify pending payments

## User Features

- Browse landing page with hero and feature sections
- View full movie details and cast list
- Add movies to favorites
- Select date, time, and seats for a show
- Prevent selecting seats that are already booked
- Checkout through Stripe payment
- View booking history and upcoming bookings

## Admin Features

- Admin login via Clerk
- Add new shows for movies with multiple dates and times
- Dashboard with total bookings, revenue, active shows, and total users
- View all shows and all bookings
- Protect routes using admin role verification

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Clerk, React Hot Toast
- Backend: Node.js, Express, MongoDB, Mongoose, Stripe, Inngest, Clerk Express
- APIs: TMDB for movie details, Stripe Checkout, Clerk authentication

## Project Structure

- `client/` — React frontend
- `server/` — Express backend
- `server/configs/` — DB and Axios configuration
- `server/controllers/` — API business logic
- `server/models/` — MongoDB schemas
- `server/Routes/` — Express route definitions
- `server/middleware/` — auth middleware
- `server/inngest/` — background task configuration

## Setup

### Prerequisites

- Node.js 18+ / npm
- MongoDB instance or MongoDB Atlas
- Stripe account and secret key
- Clerk application credentials

### Install dependencies

```bash
cd server
npm install
cd ../client
npm install
```

### Environment Variables

Create a `.env` file in the `server/` folder and provide:

```env
MONGODB_URI=<your-mongodb-uri>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
CLERK_API_KEY=<your-clerk-api-key>
CLERK_FRONTEND_API=<your-clerk-frontend-api>
CLERK_SIGN_IN_URL=<your-clerk-sign-in-url>
CLERK_SIGN_UP_URL=<your-clerk-sign-up-url>
```

### Run the app

```bash
cd server
npm run server
```

In another terminal:

```bash
cd client
npm run dev
```

## High-Level Design (HLD)

This section describes the major system components and how they interact.

Client Browser
  |
  | (HTTP requests / React UI)
  v
+------------------+       +------------------+       +--------------------+
| React Frontend   | <-->  | Express API      | <-->  | MongoDB Database   |
| - Home           |       | - /api/show      |       | - movies           |
| - Movie Details  |       | - /api/booking   |       | - shows            |
| - Seat Layout    |       | - /api/user      |       | - bookings         |
| - My Bookings    |       | - /api/admin     |       | - users            |
| - Admin Pages    |       +------------------+       +--------------------+
| - Clerk auth     |                |
| - Stripe checkout|                | (Webhooks & background tasks)
+------------------+                v
                                  +------------------+
                                  | Stripe           |
                                  +------------------+
                                      |
                                      | (payment sessions)
                                      v
                                  +------------------+
                                  | Inngest          |
                                  +------------------+

### HLD Explanation

- The React frontend handles the user experience: browsing movies, selecting tickets, and booking.
- The Express API serves data, enforces admin permissions, and performs booking operations.
- MongoDB stores movie metadata, show schedules, bookings, and user information.
- Stripe Checkout handles payment links and success/cancel flows.
- Inngest background tasks verify delayed payment status and keep booking state consistent.
- Clerk handles user authentication, favorites, and admin role verification.

## Low-Level Design (LLD)

### Data Models

#### Movie

- `_id`: String (TMDB movie ID)
- `title`: String
- `overview`: String
- `poster_path`: String
- `backdrop_path`: String
- `release_date`: String
- `original_language`: String
- `tagline`: String
- `genres`: Array
- `casts`: Array
- `vote_average`: Number
- `runtime`: Number

#### Show

- `movie`: String (reference to `Movie`)
- `showDateTime`: Date
- `showPrice`: Number
- `occupiedSeats`: Object

#### Booking

- `user`: String (Clerk user ID)
- `show`: String (reference to `Show`)
- `amount`: Number
- `bookedSeats`: Array
- `isPaid`: Boolean
- `paymentLink`: String

#### User

- `_id`: String (Clerk user ID)
- `name`: String
- `email`: String
- `image`: String

### API Endpoints

#### Show API

- `GET /api/show/now-playing` — fetch movies from TMDB
- `GET /api/show/all` — return active shows from DB
- `GET /api/show/:movieId` — return movie details and showtime groups
- `POST /api/show/add` — create show schedules for a movie

#### Booking API

- `POST /api/booking/create` — create a booking, reserve seats, and issue Stripe session
- `GET /api/booking/seats/:showId` — return occupied seats for a show

#### User API

- `GET /api/user/bookings` — return bookings for the signed-in user
- `POST /api/user/update-favorite` — toggle movie favorite state
- `GET /api/user/favorites` — return favorite movies

#### Admin API

- `GET /api/admin/is-admin` — verify admin role
- `GET /api/admin/dashboard` — admin analytics data
- `GET /api/admin/all-shows` — list all active shows
- `GET /api/admin/all-bookings` — list all bookings

### Auth Flow

- Clerk authenticates users on the frontend.
- The backend receives a Clerk auth token for every protected request.
- `protectAdmin` middleware checks `user.privateMetadata.role === 'admin'`.
- Admin-only routes are blocked for non-admin users.

### Seat Booking Flow

1. User selects movie and date/time.
2. Frontend requests occupied seats for the selected show.
3. User selects free seats up to the allowed limit.
4. Frontend submits booking request.
5. Backend checks seat availability and reserves seats.
6. Backend creates booking and a Stripe checkout session.
7. User is redirected to Stripe to pay.
8. Inngest verifies payment and updates booking status later.

### Admin Show Creation Flow

1. Admin adds a movie show using a TMDB movie ID.
2. Backend fetches movie metadata and credits from TMDB.
3. It stores the movie and creates show schedules.
4. Admin dashboard displays new active shows and bookings.
