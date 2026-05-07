# Midiscanai — Medical Intelligence Platform

AI-powered medical report analysis built with Next.js, Node.js, and OpenAI GPT-4o.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) 
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) 
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) 
![OpenAI GPT-4o](https://img.shields.io/badge/OpenAI_GPT--4o-7C3AED?style=for-the-badge&logo=openai&logoColor=white) 
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) 
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white) 
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) 
![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## Project Description

Midiscanai is a professional-grade medical intelligence platform designed to bridge the gap between complex clinical reports and patient understanding. By leveraging advanced OCR and AI reasoning, it provides instant, data-driven insights from scanned reports, helping users understand their health metrics in clear, actionable language.

The architecture is built for production environments, featuring a high-performance Next.js 14 frontend and a robust Node.js Express backend. It integrates Tesseract.js for image OCR, pdf-parse for medical documents, and OpenAI GPT-4o for clinical reasoning. Data security is prioritised through HIPAA-compliant PII scrubbing and AES-256 encryption.

## Features

- ✅ **Secure Uploads**: Support for PNG, JPG, PDF, and TXT medical reports.
- ✅ **AI Analysis**: Deep clinical insights powered by OpenAI GPT-4o.
- ✅ **OCR Engine**: Scanned image text extraction using Tesseract.js & Sharp.
- ✅ **PDF Extraction**: Multi-page text parsing with pdf-parse.
- ✅ **HIPAA Compliance**: Automatic PII scrubbing before AI processing.
- ✅ **Data Security**: AES-256-CBC encryption for sensitive stored data.
- ✅ **Authentication**: JWT-based secure login with email verification.
- ✅ **Audit Logging**: Comprehensive trail for sensitive system actions.
- ✅ **Visual Dashboard**: Color-coded risk scores and condition levels.
- ✅ **Cost Estimator**: Treatment estimates in Indian Rupees.
- ✅ **Responsive UI**: Fully optimized for mobile and desktop screens.
- ✅ **White-Label Branding**: Professional custom design with zero watermarks.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 + React + Tailwind CSS + Framer Motion |
| **Backend** | Node.js + Express.js |
| **AI Model** | OpenAI GPT-4o via official Node.js SDK |
| **OCR** | Tesseract.js + Sharp Image Preprocessing |
| **PDF Parsing** | pdf-parse |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | JWT + bcryptjs |
| **Email** | Nodemailer |
| **File Upload** | Multer |
| **Deployment** | Vercel (Frontend) + Railway.app (Backend) |

## Project Structure

```bash
midiscanai/
├── app/                  # Next.js App Router (Frontend)
├── backend/              # Node.js Express Server
│   ├── prisma/           # Database Schema
│   └── src/
│       ├── controllers/  # API Logic
│       ├── middleware/   # Security & Auth
│       ├── routes/       # API Endpoints
│       ├── services/     # AI, OCR, DB Services
│       └── utils/        # Helpers
├── public/               # Static Assets
└── src/
    └── api/              # Frontend API Client
```

## Getting Started

Follow these steps to set up and run the complete Midiscanai full-stack application on your local machine.

### 📦 Prerequisites

Ensure you have the following installed before proceeding:
- **Node.js**: Version 18 or higher ([Download](https://nodejs.org/))
- **npm**: Version 9 or higher
- **pnpm**: Recommended for faster and more reliable dependency management
  ```bash
  npm install -g pnpm
  ```
- **Tesseract OCR**: Required for extracting text from scanned medical reports.
  - **Windows**: Install from [UB-Mannheim Wiki](https://github.com/UB-Mannheim/tesseract/wiki) and add `C:\Program Files\Tesseract-OCR` to your system **PATH**.
  - **macOS**: `brew install tesseract`
  - **Linux**: `sudo apt install tesseract-ocr`

---

### 🛠️ Backend Setup (Express)

The backend handles AI analysis, OCR, and data persistence.

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure environment variables**:
    - Create a `.env` file by copying the template:
      ```bash
      # Windows (Command Prompt)
      copy .env.example .env
      # macOS/Linux/PowerShell
      cp .env.example .env
      ```
    - Open `.env` and provide your **OpenAI API Key**:
      ```env
      OPENAI_API_KEY=your_sk_key_here
      ```
    - (Optional) Adjust the `PORT` (default is 5000) or database settings.

4.  **Initialize the Database (SQLite)**:
    - We use Prisma with SQLite for easy local setup (no external DB install required).
    - Sync the schema and generate the client:
      ```bash
      npx prisma migrate dev --name init
      ```

---

### 🌐 Frontend Setup (Next.js)

The frontend is a modern Next.js application.

1.  **Navigate to the root directory**:
    ```bash
    cd ..
    ```

2.  **Install dependencies**:
    ```bash
    pnpm install
    ```

3.  **Configure local environment**:
    - Create a `.env.local` file in the root directory:
      ```bash
      # Windows (PowerShell)
      echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
      ```
    - Ensure `NEXT_PUBLIC_API_URL` matches your backend port.

---

### 🚀 Running Locally

To run the application, you need to start **both** servers in separate terminal windows.

#### Terminal 1: Backend Server
```bash
cd backend
npm run dev
```
*Expected output: `Midiscanai API server running on port 5000`*

#### Terminal 2: Frontend Server
```bash
# In the root directory
npm run dev
```
*Expected output: `ready - started server on 0.0.0.0:3000`*

Now, open **[http://localhost:3000](http://localhost:3000)** in your browser to access the platform.

---

### 🧪 Testing the Analysis Flow

1.  **Upload**: Select a medical report (JPG, PNG, or PDF). 
    - *Note: Ensure the file size is between 10KB and 40MB.*
2.  **Analyze**: Click on the **Analyze Report** button.
3.  **Results**: Wait for the AI to process the document (usually 10-30 seconds). You will receive a detailed dashboard with color-coded risk metrics and clinical explanations.

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | No | User registration |
| POST | `/api/auth/login` | No | User authentication |
| POST | `/api/upload` | No* | File upload (PNG/JPG/PDF/TXT) |
| POST | `/api/analyze` | No* | Trigger AI report analysis |
| GET | `/api/results/:id` | No* | Retrieve analysis findings |

*\* Auth required in production configuration.*

## Environment Variables

| Variable | Service | Required | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | Backend | Yes | Your OpenAI API key from platform.openai.com/api-keys |
| `DATABASE_URL` | Backend | Yes | PostgreSQL/SQLite URL |
| `SECRET_KEY` | Backend | Yes | JWT Signing Secret |
| `ENCRYPTION_KEY` | Backend | Yes | AES Encryption Hex Key |
| `NEXT_PUBLIC_API_URL` | Frontend | Yes | Backend API Endpoint |

---

*Designed by Aditya, an area student*  
**CREATED BY BMS**  
Licensed under MIT
