# Midiscanai Localhost Running Guide

Follow this guide to run the complete Midiscanai fullstack application locally on Windows, macOS, or Linux.

## System Requirements
- **Node.js**: Version 18 or higher (`node --version`)
- **npm**: Version 9 or higher (`npm --version`)
- **Git**: For repository cloning (`git --version`)
- **RAM**: Minimum 4GB
- **Disk Space**: Minimum 3GB
- **Internet**: Required for AI API calls (Anthropic)

## 1. Install Tesseract for Image OCR
Tesseract is required to extract text from scanned medical images.
- **Windows**: Download and run the installer from [UB-Mannheim Tesseract Wiki](https://github.com/UB-Mannheim/tesseract/wiki). Add `C:\Program Files\Tesseract-OCR` to your system PATH.
- **macOS**: Run `brew install tesseract`.
- **Linux**: Run `sudo apt-get update && sudo apt-get install tesseract-ocr`.
- **Verify**: Run `tesseract --version` in a new terminal.

## 2. Install pnpm (Recommended)
To avoid potential hanging issues with standard npm on large project dependencies, we use `pnpm`:
```bash
npm install -g pnpm
```

## 3. First Time Setup
1. **Clone & Enter**:
   ```bash
   git clone <repository-url>
   cd midiscanai
   ```
2. **Backend Config**:
   ```bash
   cd backend
   npm install
   copy .env.example .env   # Use 'cp' on Mac/Linux
   ```
   Open `.env` and add your `ANTHROPIC_API_KEY` from [console.anthropic.com](https://console.anthropic.com).
3. **Database Initialization**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. **Frontend Config**:
   ```bash
   cd ../
   pnpm install
   echo NEXT_PUBLIC_API_URL=http://localhost:5000 > .env.local
   ```

## 4. Running the Application
Open two separate terminal windows:

| Terminal | Navigation | Command | Expected Output |
|---|---|---|---|
| **Terminal 1** | `backend/` | `npm run dev` | Midiscanai API server running on port 5000 |
| **Terminal 2** | Root | `npm run dev` | ready - started server on 0.0.0.0:3000 |

## 5. Testing the Flow
1. Open [http://localhost:3000](http://localhost:3000).
2. **Create a Test File**: Create a TXT file (>10KB) with search terms like "Hemoglobin", "Glucose", or "WBC Count".
3. **Upload**: Drag the file into the upload zone.
4. **Analyze**: Click "Analyze Report" and wait ~30 seconds for the AI metrics to appear.

## Troubleshooting
- **Port 5000 busy**: Find and kill the process using `lsof -i :5000` (Unix) or `netstat -ano | findstr :5000` (Windows).
- **Prisma Error**: Run `npx prisma generate` inside the `backend/` folder.
- **File size error**: Ensure your test file is exactly between 10240 and 40960 bytes.
- **OCR failing**: Confirm `tesseract --version` is accessible from your terminal path.
