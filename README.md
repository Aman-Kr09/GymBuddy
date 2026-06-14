# 🏋️‍♂️ GymBuddy - Find Your Perfect Gym & Workout Buddy

GymBuddy is a comprehensive fitness community platform designed to help users find gyms, connect with workout partners, chat in real-time, and get AI-driven buddy/gym recommendations.

💻 **Live Site:** [https://gymbuddy-client-aman.onrender.com/](https://gymbuddy-client-aman.onrender.com/)

---

## 🌟 Features

*   **Smart Recommendations:** AI/ML recommendation service matching you with gym buddies and gyms based on fitness goals, schedule preferences, age, and location compatibility.
*   **Interactive Maps:** Visual gym search and locator built with Leaflet.
*   **Real-time Chat:** Instant messaging powered by Socket.io to coordinate workouts with your gym buddies.
*   **User Profiles:** Complete profile personalization detailing goals, interests, schedule preference, gender matching preferences, and physical location.
*   **Gym Management:** Detailed gym listings featuring facilities, membership pricing, rating summaries, and location-based discovery.

---

## 🛠️ Project Structure

This is a monorepo consisting of three main components:

1.  **`/client`**: Next.js (React 19, Tailwind CSS, Framer Motion) frontend client.
2.  **`/server`**: Express.js (Node.js, MongoDB/Mongoose, Socket.io) backend REST API and WebSocket server.
3.  **`/ml-service`**: FastAPI (Python, Scikit-learn) Machine Learning microservice providing cosine-similarity-based matching for buddies and gyms.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+) & npm
*   Python (3.9+)
*   MongoDB instance (local or Atlas)
*   Cloudinary credentials (for profile photo uploads)

---

### 1. Frontend Setup (`/client`)

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_WS_URL=http://localhost:5000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it.

---

### 2. Backend Setup (`/server`)

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Create a `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_signing_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ML_SERVICE_URL=http://127.0.0.1:8000
   ```
4. Run the API and WebSocket server:
   ```bash
   npm run dev
   ```

---

### 3. ML Service Setup (`/ml-service`)

1. Navigate to the ML service directory:
   ```bash
   cd ml-service
   ```
2. Create a Python virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI microservice:
   ```bash
   python app.py
   ```
   The service will run locally on [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

## 📝 License

This project is licensed under the ISC License.
