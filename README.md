# 🌱 KisanGPT: AI Agricultural Assistant

KisanGPT is a full-stack, AI-powered agricultural advisory platform designed to help farmers with crop management, fertilizer dosages, and general farming practices. It uses a **Retrieval-Augmented Generation (RAG)** pipeline to fetch accurate data from official agricultural PDFs and a structured SQL database, delivering answers through a modern, responsive chat interface.

## ✨ Features
* **Intelligent RAG Pipeline:** Combines Gemini 2.5 Flash with Qdrant Vector Search to answer queries based on actual agricultural manuals.
* **Hybrid Database:** Uses Qdrant for unstructured data (PDFs) and SQLite for structured tabular data (NPK Fertilizer guidelines).
* **Source Citations:** Transparently displays the source documents used to generate the AI's answer.
* **Multilingual Support:** Capable of responding in English, Hindi, and other regional languages.
* **Premium UI/UX:** A responsive, warm, earthy-themed React frontend with collapsible sidebars and fluid animations.

## 🛠️ Tech Stack
**Frontend:**
* React.js (Vite)
* Custom CSS (Responsive, Flexbox layout)
* Lucide React (Icons)
* Deployed on **Vercel**

**Backend:**
* Python & FastAPI
* Google GenAI SDK (`gemini-2.5-flash`)
* Qdrant (Vector Database)
* SQLModel / SQLite (Relational Database)
* Deployed on **Render**

## 🚀 Live Demo
* **Frontend Application:** https://kisangpt-ten.vercel.app/
* **Backend API Docs:** https://kisangptv2.onrender.com/docs

---
