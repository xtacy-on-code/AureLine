# ✦ AureLine — AI-Powered PDF Highlighter

> Upload any PDF. Get AI-generated highlights instantly.

**Live Demo:** [aure-line.vercel.app](https://aure-line.vercel.app)

---

## What is AureLine?

AureLine is a full-stack web application that lets users upload PDF documents and receive AI-generated highlights categorized as:

- 🟡 **Definitions** — key terms and their meanings
- 🔵 **Key Concepts** — main ideas and topics
- 🟢 **Important Points** — critical information to remember

Key Feature: The highlights are drawn directly onto the PDF, on the exact words the AI picked, and users can download the highlighted version or reopen it later from their library.

---

## Tech Stack

**Frontend**
- React.js + Vite (routes lazy loaded)
- Tailwind CSS v4 with an "Ink & Paper" design system ([client/DESIGN.md](client/DESIGN.md))
- react-pdf (PDF rendering)
- Phosphor icons, Thinking Orbs (AI loading state), Geist + Instrument Serif

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer (file uploads)
- pdfjs-dist (text extraction and phrase positions)
- pdf-lib (drawing highlights)
- Vercel Blob, private store (saved highlighted PDFs)
- express-rate-limit (auth throttling)

**AI**
- Groq API (`openai/gpt-oss-120b`) in JSON mode
- Prompt engineering for structured JSON output
- Text budgeted per page to fit Groq's free-tier token limit

**Deployment**
- Frontend → Vercel
- Backend → Vercel (Express as a serverless function)
- Database → MongoDB Atlas
- PDFs → Vercel Blob

---

## Features

- 🔐 Secure user authentication (JWT)
- 📄 PDF upload and processing
- 🤖 AI-powered highlight extraction
- 🎨 Color-coded highlights by category
- 📍 Highlights land on the exact phrase, across line breaks and hyphenation
- 🗂️ Highlights sidebar with filters; click one to jump to its page
- ⬇️ Download highlighted PDF
- 📚 Library of past documents you can reopen or delete
- 🛡️ Rate-limited auth and a daily upload cap

---

## How It Works

```
User uploads PDF
    → pdfjs reads every page once (text + character positions)
        → AI picks up to 10 phrases (Groq, JSON mode)
            → Each phrase is matched to its exact span on the page
                → pdf-lib draws colored rectangles on those words
                    → Highlighted PDF saved to Blob, viewer opens /doc/:id
```

---

## Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Groq API key

### Backend
```bash
cd server
npm install
```

Create `.env` file:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

```bash
npm run dev
npm test        # highlight matching and AI output tests
```

### Frontend
```bash
cd client
npm install
```

Create `.env` file:
```
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

Open `http://localhost:5173`

---

## Project Structure

```
AureLine/
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── aiController.js      # Groq AI integration
│   │   │   └── pdfController.js     # PDF highlighting logic
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT middleware
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Document.js
│   │   │   └── Highlight.js
│   │   └── routes/
│   │       ├── auth.js              # Signup/Login
│   │       ├── upload.js            # PDF processing
│   │       └── documents.js         # History, open, stream PDF, delete
│   ├── test/                        # node:test suites
│   ├── api/index.js                 # Vercel entry
│   └── index.js
└── client/
    └── src/
        ├── components/              # Button, Field, Marker, viewer/, landing/
        ├── context/
        │   └── AuthContext.jsx      # Global auth state
        ├── hooks/useApi.js          # API calls, logs out on expired token
        ├── pages/
        │   ├── Landing.jsx
        │   ├── Login.jsx
        │   ├── Signup.jsx
        │   ├── Dashboard.jsx
        │   ├── Upload.jsx
        │   └── Viewer.jsx
        └── App.jsx
```

---

## Author

**Vedant Zala** — B.Tech CSE @ IIT Bhilai  
[github.com/xtacy-on-code](https://github.com/xtacy-on-code) · [linkedin.com/in/vedantzala](https://linkedin.com/in/vedantzala)
