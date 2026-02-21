# Stok API

Product inventory management backend built with Node.js, Express, MongoDB, and Swagger.

## Tech Stack

- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** authentication
- **Swagger** API documentation
- **express-validator** request validation

## Setup

```bash
# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/stok-api` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_EXPIRE` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRE` | Refresh token expiry | `7d` |

## API Documentation

After starting the server, visit:

```
http://localhost:5000/api-docs
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |

### Products (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (filter, paginate, search) |
| GET | `/api/products/low-stock` | Low stock products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Categories (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

### Warehouses (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/warehouses` | List warehouses |
| POST | `/api/warehouses` | Create warehouse |
| PUT | `/api/warehouses/:id` | Update warehouse |
| DELETE | `/api/warehouses/:id` | Delete warehouse |

## Project Structure

```
stok-api/
├── src/
│   ├── config/         # DB connection, Swagger config
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes with Swagger docs
│   └── app.js          # Express app setup
├── server.js           # Entry point
├── .env.example
└── package.json
```
