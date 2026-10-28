# MEAN Stack Assessment

A full-stack assessment application built with **Angular 21**,
**Node.js**, **Express**, **MongoDB**, and **MySQL**. It includes
JWT-based authentication, product and order management, and current
weather lookup.

## Features

-   **Authentication:** User registration and login with JWT and bcrypt.
-   **Protected routes:** Token-based access control for authenticated
    APIs.
-   **Products:** Create, view, update, and delete products.
-   **Orders:** Create and manage orders; totals are calculated by the
    backend.
-   **Order ownership:** Users can access only their own orders.
-   **Weather:** Search current weather by city using the Open-Meteo
    API.

## Tech Stack

  Area                         Technologies
  ---------------------------- -------------------------------
  Frontend                     Angular 21, TypeScript
  Backend                      Node.js, Express.js
  Databases                    MongoDB, MySQL
  Authentication               JSON Web Tokens (JWT), bcrypt
  Local database environment   Docker
  Weather data                 Open-Meteo

## Project Structure

``` text
mean-assessment/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json
└── README.md
```

*Folder names may vary slightly depending on your current
implementation.*

## Prerequisites

-   Node.js and npm
-   Angular CLI compatible with Angular 21
-   Docker
-   MongoDB and MySQL running locally

## Getting Started

### 1. Start the databases

Start your MongoDB and MySQL Docker containers. Make sure they are
accessible at the host and ports configured in the backend environment.

### 2. Configure the backend

Create `backend/.env` and set your local values:

``` env
PORT=3000

MONGODB_URI=mongodb://127.0.0.1:27017/mean_assessment

MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=mean_assessment
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password

JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=1h
```

Use your own database credentials and a strong, private JWT secret. **Do
not commit `.env` or real credentials to Git.**

### 3. Install dependencies

From the repository root, run:

``` bash
cd backend
npm install
```

Then, in a separate terminal:

``` bash
cd frontend
npm install
```

### 4. Run the application

Start the backend:

``` bash
cd backend
npm run dev
```

Start the Angular development server in another terminal:

``` bash
cd frontend
ng serve
```

Open **http://localhost:4200** in your browser. The backend API runs at
**http://localhost:3000** by default.

## API Overview

  ---------------------------------------------------------------------------------
  Method            Endpoint                    Description       Access
  ----------------- --------------------------- ----------------- -----------------
  `POST`            `/api/auth/register`        Register a user   Public

  `POST`            `/api/auth/login`           Log in            Public

  `GET`             `/api/auth/me`              Get the current   JWT required
                                                user              

  `GET`             `/api/products`             List products     JWT required

  `GET`             `/api/products/:id`         Get a product     JWT required

  `POST`            `/api/products`             Create a product  JWT required

  `PUT`             `/api/products/:id`         Update a product  JWT required

  `DELETE`          `/api/products/:id`         Delete a product  JWT required

  `GET`             `/api/orders`               List the current  JWT required
                                                user's orders     

  `GET`             `/api/orders/:id`           Get an order      JWT required

  `POST`            `/api/orders`               Create an order   JWT required

  `PUT`             `/api/orders/:id`           Update an order   JWT required

  `DELETE`          `/api/orders/:id`           Delete an order   JWT required

  `GET`             `/api/weather?city=Delhi`   Get weather for a Public
                                                city              
  ---------------------------------------------------------------------------------

For protected endpoints, send the token in the request header:

``` http
Authorization: Bearer <your-jwt-token>
```

## Implementation Notes

-   **MySQL** stores user records; **MongoDB** stores products and
    orders.
-   Order totals are calculated on the server using stored product
    prices.
-   Order access is scoped to the authenticated user.
-   Weather data is fetched from Open-Meteo.

## Development

Run the backend test suite, if configured:

``` bash
cd backend
npm test
```

------------------------------------------------------------------------

Made as a full-stack MEAN assessment project.
