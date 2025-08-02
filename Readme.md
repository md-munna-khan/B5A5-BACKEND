# 🚖 Ride Booking API  
A secure, scalable backend for a ride-hailing platform (like Uber/Pathao) built with **Node.js**, **Express**, and **TypeScript**. It supports **role-based authentication**, **real-time ride management**, **driver earnings**, and **feedback system**.

---



---

## ✅ Features  
✔ Role-based Authentication (**RIDER**, **DRIVER**, **ADMIN**)  
✔ Google OAuth & JWT authentication  
✔ Riders can **request**, **cancel**, and **track rides**  
✔ Drivers can **accept**, **reject**, and **complete rides**  
✔ **Dynamic Fare Calculation** (configurable logic)  
✔ Rider ↔ Driver **feedback system**  
✔ GeoJSON-based **pickup & destination location**  
✔ Driver earnings summary and ride history  
✔ Robust **Zod validation** & **error handling**  

---

## 🛠 Tech Stack  
- **Backend:** Node.js, Express, TypeScript  
- **Database:** MongoDB with Mongoose  
- **Authentication:** JWT, Passport (Google OAuth)  
- **Validation:** Zod  
- **File Uploads:** Multer + Cloudinary  
- **Utilities:** Winston logger, bcrypt for password hashing  

---


Project Structure
src/
├── modules/
│   ├── auth/          # Login, Register, JWT logic
│   ├── user/          # Common user logic
│   ├── driver/        # Driver-specific features
│   ├── ride/          # Ride request & management
├── middlewares/       # Authentication & Role Guards
├── config/            # Environment & DB config
├── utils/             # Helpers (validators, constants)
├── app.ts             # Entry point



---

## ⚙️ Installation & Setup

### ✅ Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud)
- npm or yarn

### ✅ Steps
```bash
# Clone the repository
git clone https://github.com/md-munna-khan/B5A5-BACKEND
cd ride-booking-api
```
# Install dependencies
```
npm install
```
# Create environment file
cp .env.example .env

# Configure environment variables in .env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ride-booking
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d

✅ Environment Variables (.env.example)
Create a .env file in the project root and add the following variables:
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/ride-booking

# JWT Config
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# Refresh Token Config
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Google OAuth (if using social login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

 Run the Development Server
### Start in development mode with nodemon
npm run dev


### Build for Production
npm run build
npm start

## 🌐 Live API  
**Base URL:**  
https://assigment-b5-a5-munna.vercel.app


## 🧪 API Testing & Documentation

Test all endpoints easily using Postman.  
👉 [View Postman Collection](https://www.postman.com/your-link)

[text](<c:/Users/user/Downloads/Programs/B5-A5 Ride Mangement.postman_collection.json>)
## 🛠 API Endpoints
 
 ## Auth Routes (/auth)
| Method | Endpoint                       | Description                |
| ------ | ------------------------------ | -------------------------- |
| `POST` | `/api/v1/auth/login`           | Login user and return JWT  |
| `POST` | `/api/v1/auth/refresh-token`   | Get new access token       |
| `POST` | `/api/v1/auth/logout`          | Logout user                |
| `POST` | `/api/v1/auth/change-password` | Change password            |
| `POST` | `/api/v1/auth/set-password`    | Set new password           |
| `POST` | `/api/v1/auth/forgot-password` | Send password reset link   |
| `POST` | `/api/v1/auth/reset-password`  | Reset password using token |
| `GET`  | `/api/v1/auth/google`          | Google OAuth login         |
| `GET`  | `/api/v1/auth/google/callback` | Google OAuth callback      |





## User Routes (/users)
| Method  | Endpoint                  | Description                |
| ------- | ------------------------- | -------------------------- |
| `GET`   | `/api/v1/users`           | Get all users (Admin only) |
| `GET`   | `/api/v1/users/me`        | Get current logged-in user |
| `POST`  | `/api/v1/users/register`  | Register a new user        |
| `PATCH` | `/api/v1/users/block/:id` | Block or unblock a user    |
| `PATCH` | `/api/v1/users/:id`       | Update user details        |
| `GET`   | `/api/v1/users/:id`       | Get single user details    |



## Driver Routes (/drivers)
| Method   | Endpoint                            | Description                         |
| -------- | ----------------------------------- | ----------------------------------- |
| `POST`   | `/api/v1/drivers/apply`             | Rider applies to become a driver    |
| `PATCH`  | `/api/v1/drivers/approve/:id`       | Approve driver application (Admin)  |
| `PATCH`  | `/api/v1/drivers/suspend/:id`       | Suspend driver (Admin)              |
| `GET`    | `/api/v1/drivers`                   | Get all drivers (Admin)             |
| `GET`    | `/api/v1/drivers/:id`               | Get single driver details           |
| `PATCH`  | `/api/v1/drivers/:id`               | Update driver details               |
| `DELETE` | `/api/v1/drivers/:id`               | Delete driver (Admin)               |
| `PATCH`  | `/api/v1/drivers/online-status/:id` | Update driver online/offline status |
| `PATCH`  | `/api/v1/drivers/riding-status/:id` | Update driver riding status         |
| `PATCH`  | `/api/v1/drivers/location/:id`      | Update driver current location      |



Ride Routes (/rides)


| Method  | Endpoint                               | Description                              |
| ------- | -------------------------------------- | ---------------------------------------- |
| `GET`   | `/api/v1/rides`                        | Get all rides (Admin only)               |
| `GET`   | `/api/v1/rides/me`                     | Get all rides for the logged-in rider    |
| `GET`   | `/api/v1/rides/driver`                 | Get all rides for the logged-in driver   |
| `GET`   | `/api/v1/rides/earnings/me`            | Get driver earnings summary              |
| `GET`   | `/api/v1/rides/available`              | Get available rides for driver           |
| `POST`  | `/api/v1/rides/request`                | Create a new ride request                |
| `PATCH` | `/api/v1/rides/:id/cancel`             | Cancel a ride (only if not yet accepted) |
| `PATCH` | `/api/v1/rides/:id/accept`             | Accept a ride request                    |
| `PATCH` | `/api/v1/rides/:id/reject`             | Reject a ride request                    |
| `PATCH` | `/api/v1/rides/:id/pickup`             | Mark ride as picked up                   |
| `PATCH` | `/api/v1/rides/:id/transit`            | Mark ride as in transit                  |
| `PATCH` | `/api/v1/rides/:id/complete`           | Complete the ride  
| `PATCH` | `/api/v1/rides/:id/status`             | Update ride status (generic endpoint)|                      
| `POST`  | `/api/v1/rides/:rideId/driver-ratings` | Give feedback for a driver               |
| `PUT`   | `/api/v1/rides/:id/feedback`           | Give feedback for a rider                |


## Testing & Documentation
✔ Use Postman to test all endpoints
✔ Include Authorization: Bearer <token> for protected routes
✔ Import Postman collection (if available)

🚀 Future Enhancements
✅ Driver Ratings & Rider Feedback system (partially implemented)

✅ Fare Estimation Logic

✅ Real-time Driver Matching using WebSockets

✅ Geo-based Driver Search

✅ Admin Dashboard with Analytics

