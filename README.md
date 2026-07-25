# PaperBuddy India

PaperBuddy India is a modern educational management and smart financing platform. Designed with a stunning, glassmorphism-inspired SaaS aesthetic, it simplifies payments, tracks tasks, and connects students with administrators, cashiers, and mentors effortlessly.

## 🚀 Features

- **Role-Based Access Control (RBAC):**
  - **Student/User Dashboard:** Track payments, view academic progress, and manage tasks.
  - **Mentor Dashboard:** Oversee student performance and guide academic journeys.
  - **Cashier Dashboard:** Handle transactions, verify payments, and manage fee structures.
  - **Admin & Superadmin:** Complete oversight of the institution, including user management, global fee types, and scholarship configurations.
- **Smart Financing:** Streamline fee collections, manage scholarships, and track financial transactions securely.
- **Responsive & Modern UI:** A fully responsive interface featuring floating glass cards, subtle animations, and an intuitive layout.
- **Dark/Light Mode:** First-class support for both light and dark themes using a beautiful custom UI token system.
- **Integrated AI Chatbot:** Get quick answers and assistance without leaving the page.

## 🛠️ Tech Stack

- **Frontend:**
  - React.js
  - React Router DOM
  - Vanilla CSS (Glassmorphism & Flex/Grid layouts)
  - Lucide React (Icons)
- **Backend:**
  - Node.js
  - Express.js
  - MongoDB (Mongoose)
  - JWT Authentication

## 📦 Installation & Setup

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd paper-buddy
```

### 2. Setup the Server
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and add your environment variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```
Run the server:
```bash
npm start
```

### 3. Setup the Client
```bash
cd ../client
npm install
```
Run the development server:
```bash
npm run dev
```

The client will be available at `http://localhost:5173/` and the API server at `http://localhost:5000/`.

## 🎨 Design Philosophy

The application utilizes a highly custom CSS framework avoiding generic utility classes where possible. It prioritizes:
- **Visual Excellence:** Soft shadows, vibrant gradients, and premium typography.
- **Micro-animations:** Elements respond smoothly to user interaction.
- **Glassmorphism:** Heavy use of `backdrop-filter` and semi-transparent backgrounds to create depth.

---
*Funding futures, simplifying learning.*
