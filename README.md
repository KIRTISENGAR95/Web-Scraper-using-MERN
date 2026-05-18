# Hacker News Scraper & Bookmark Manager

A full-stack MERN application that automatically scrapes the top tech stories from Hacker News, stores them in a MongoDB database, and provides a sleek, responsive React frontend for users to browse and bookmark their favorite discussions.

## 🚀 Project Overview

This project was built to demonstrate a clean, scalable architecture separating the backend API service and the frontend client. 
- **The Backend** runs on an automated cycle, fetching and parsing HTML from Hacker News using Cheerio, performing bulk upserts to prevent duplicates, and exposing RESTful APIs secured by JWT authentication.
- **The Frontend** is a blazingly fast React Single Page Application (SPA) built with Vite, featuring protected routes, real-time toast notifications, and a premium card-based UI.

## 💻 Tech Stack

**Frontend:**
- React 18 (Vite)
- React Router DOM (Client-side Routing)
- Axios (API Client with Interceptors)
- Lucide React (Icons)
- date-fns (Date Formatting)
- React Hot Toast (Notifications)
- Vanilla CSS

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- Cheerio & Axios (Web Scraping)
- JSON Web Tokens (JWT Auth)
- bcryptjs (Password Hashing)
- Helmet, CORS, Morgan (Security & Logging)

## 📸 Screenshots
*(Replace these placeholders with actual images of your application)*

- **Home Feed:** `[Insert Screenshot]`
- **Login/Register:** `[Insert Screenshot]`
- **Bookmarks Page:** `[Insert Screenshot]`

## ⚙️ Environment Variables

To run this project locally, you will need to add the following environment variables to your `.env` files.

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/mern_app
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🛠️ Setup Instructions

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd "Web Scraper"
```

**2. Setup the Backend**
```bash
cd backend
npm install
# Ensure your MongoDB server is running locally or provide an Atlas URI in .env
npm run dev
```
*(The backend will run on `http://localhost:5000` and automatically trigger an initial scrape on startup).*

**3. Setup the Frontend**
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*(The frontend will run on `http://localhost:5173`).*

## 🌐 API Endpoints

| HTTP Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Check server health and uptime | Public |
| **POST** | `/api/scrape` | Manually trigger Hacker News scraper | Public |
| **GET** | `/api/stories` | Fetch paginated stories | Public |
| **GET** | `/api/stories/:id` | Fetch a single story | Public |
| **POST** | `/api/auth/register` | Register a new user | Public |
| **POST** | `/api/auth/login` | Authenticate user & get token | Public |
| **GET** | `/api/stories/bookmarks` | Get logged-in user's bookmarked stories | **Private** |
| **POST** | `/api/stories/:id/bookmark` | Toggle bookmark for a specific story | **Private** |

## 🌍 Deployment

This project is configured for easy cloud deployment:

- **Backend (Render):** A `render.yaml` Blueprint file is included in the `backend/` directory for automated Infrastructure-as-Code deployment.
- **Frontend (Vercel):** A `vercel.json` configuration file is included in the `frontend/` directory to handle React Router SPA fallbacks.

**Live Links:**
- Frontend: `[Insert Vercel URL]`
- Backend: `[Insert Render URL]`
