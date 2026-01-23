# ClassMate - Frontend

The frontend application for the School Management System, built with **React**, **TypeScript**, and **Vite**. It features a modern, responsive UI using **Tailwind CSS** and **shadcn/ui**.

## ✨ Features

*   **Authentication:** Secure Login & Sign Up with JWT integration.
*   **Dashboard:** Overview of user activities.
*   **Course Management:**
    *   View joined/created courses.
    *   Create new courses (Teacher).
    *   Join courses via invite code (Student).
*   **Classroom Interface:**
    *   Detailed course view.
    *   Assignment listing and submission.
    *   Lecture material access.
*   **Profile:** Manage user profile and passwords.

## 🛠️ Tech Stack

*   **Framework:** React 19 + Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS 4
*   **UI Components:** shadcn/ui, Radix UI
*   **State Management:** Zustand
*   **Form Handling:** React Hook Form + Zod
*   **Routing:** React Router 7
*   **HTTP Client:** Axios

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   npm

### Installation

1.  **Clone the repository** and navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory (copy from `.env.example`):
    ```bash
    cp .env.example .env
    ```
    Ensure the API URL points to your running Backend API Gateway:
    ```env
    VITE_DEV_URL=http://localhost:8080/api
    VITE_API_URL=http://localhost:8080/api
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Access the app at [http://localhost:5173](http://localhost:5173).

## 🏗️ Build & Deploy

To build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Deployment (Vercel)
This project is configured for easy deployment on Vercel.
1.  Import project to Vercel.
2.  Set the `VITE_API_URL` environment variable to your production backend URL.
3.  Deploy.

*See `DEPLOY_VERCEL.md` for detailed deployment instructions.*

## 📂 Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/            # Utilities (axios, cn, etc.)
├── pages/          # Page components (Login, Dashboard, CourseDetail...)
├── services/       # API service calls
├── stores/         # Global state (Zustand)
└── types/          # TypeScript type definitions
```

## 🔒 Authentication Flow

The frontend handles authentication using **Access Tokens** (memory) and **Refresh Tokens** (HTTP-only cookies).
*   **Axios Interceptor:** Automatically attaches the Access Token to requests and handles 401/403 errors by attempting to refresh the token transparently.
*   **Protected Routes:** Ensures only authenticated users can access dashboard and course pages.