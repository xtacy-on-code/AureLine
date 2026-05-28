# ✦ AureLine — AI-Powered PDF Highlighter

> Upload any PDF. Get AI-generated highlights instantly.

**Live Demo:** [aure-line.vercel.app](https://aure-line.vercel.app)

---

## What is AureLine?

AureLine is a full-stack web application that lets users upload PDF documents and receive AI-generated highlights categorized as:

- 🟡 **Definitions** — key terms and their meanings
- 🔵 **Key Concepts** — main ideas and topics
- 🟢 **Important Points** — critical information to remember

Key Feature: The highlights are drawn directly onto the PDF and users can download the highlighted version.

---

## Tech Stack

**Frontend**
- React.js + Vite
- Tailwind CSS
- react-pdf (PDF rendering)

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer (file uploads)
- pdf-parse (text extraction)
- pdf-lib + pdfjs-dist (highlight rendering)

**AI**
- Groq API (LLaMA 3.3 70B)
- Prompt engineering for structured JSON output

**Deployment**
- Frontend → Vercel
- Backend → Railway
- Database → MongoDB Atlas

---

## Features

- 🔐 Secure user authentication (JWT)
- 📄 PDF upload and processing
- 🤖 AI-powered highlight extraction
- 🎨 Color-coded highlights by category
- ⬇️ Download highlighted PDF
- 📚 Document history dashboard

---

## How It Works

```
User uploads PDF
    → Backend extracts text (pdf-parse)
        → AI analyzes text (Groq/LLaMA 3.3)
            → Returns highlighted phrases with categories
                → pdf-lib draws colored rectangles on PDF
                    → Highlighted PDF sent back to user
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
```

```bash
npm run dev
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
│   │       └── upload.js            # PDF processing
│   └── index.js
└── client/
    └── src/
        ├── context/
        │   └── AuthContext.jsx      # Global auth state
        ├── pages/
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
