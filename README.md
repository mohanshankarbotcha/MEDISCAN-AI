# Midiscanai — Medical Intelligence Platform

AI-powered medical report analysis built with Next.js, Node.js, and OpenRouter (GPT-4o).

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) 
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) 
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) 
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) 
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white) 
![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## Project Description

Midiscanai is a professional-grade medical intelligence platform designed to bridge the gap between complex clinical reports and patient understanding. By leveraging advanced OCR and AI reasoning, it provides instant, data-driven insights from scanned reports, helping users understand their health metrics in clear, actionable language.

The architecture is built for production environments, featuring a high-performance Next.js 14 frontend and a robust Node.js Express backend. It integrates Tesseract.js for image OCR, pdf-parse for medical documents, and OpenRouter (GPT-4o) for clinical reasoning. Data security is prioritised through HIPAA-compliant PII scrubbing and AES-256 encryption.

## Features

- ✅ **Secure Uploads**: Support for PNG, JPG, PDF, and TXT medical reports.
- ✅ **AI Analysis**: Deep clinical insights powered by OpenRouter.
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
| **AI Model** | OpenRouter (GPT-4o/Claude) via OpenAI-compatible SDK |
| **OCR** | Tesseract.js + Sharp Image Preprocessing |
| **PDF Parsing** | pdf-parse |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | JWT + bcryptjs |
| **Email** | Nodemailer |
| **File Upload** | Multer |
| **Deployment** | Vercel (Frontend) + Railway.app (Backend) |

## System Architecture

```mermaid
graph TD
    User([User]) --> Frontend[Next.js Frontend]
    Frontend --> Backend[Node.js Express Backend]
    
    subgraph Processing Layer
        Backend --> OCR[OCR Engine: Tesseract.js / pdf-parse]
        Backend --> AI[AI Engine: OpenRouter]
        OCR --> AI
    end
    
    subgraph Data Layer
        Backend --> DB[(PostgreSQL/SQLite Database)]
        Backend --> Storage[Local/Cloud Storage]
    end
    
    AI --> Results[Clinical Insights & Metrics]
    Results --> Backend
    Backend --> Frontend
```

## Project Structure

```
MEDISCAN-AI/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js  (or next.config.js)
│
├── backend/
│   ├── server.js  (or src/index.js)
│   ├── routes/
│   ├── models/
│   └── package.json
│
└── README.md
```


## Getting Started

### Terminal 1 — Start Backend
cd backend
npm install
npm run dev

### Terminal 2 — Start Frontend
cd frontend
pnpm install
pnpm run dev

### Open in Browser
http://localhost:3000

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
| `OPENROUTER_API_KEY` | Backend | Yes | Your OpenRouter API key from openrouter.ai |
| `DATABASE_URL` | Backend | Yes | PostgreSQL/SQLite URL |
| `SECRET_KEY` | Backend | Yes | JWT Signing Secret |
| `ENCRYPTION_KEY` | Backend | Yes | AES Encryption Hex Key |
| `NEXT_PUBLIC_API_URL` | Frontend | Yes | Backend API Endpoint |

---

*Designed by Aditya Air A Boy * 
**CREATED BY BMS**  
Licensed under MIT
