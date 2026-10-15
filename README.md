# MindVault - AI Personal Knowledge Base

An AI-powered Personal Knowledge Management (PKM) application that enables users to create, organize, search, and interact with their notes using Retrieval-Augmented Generation (RAG).

The application combines traditional note-taking with semantic search and AI assistance, allowing users to quickly find information and ask natural language questions about their own knowledge base.

---

## Features

### Authentication

* User registration and login
* Secure JWT-based authentication
* Protected routes

### Note Management

* Create, edit and delete notes
* Rich text editor
* Tag support
* Responsive note cards
* Search notes instantly

### Hybrid Search

* Keyword-based search
* Semantic vector search using embeddings
* Hybrid ranking for improved retrieval accuracy

### AI Assistant (RAG)

* Chat with your personal knowledge base
* Retrieval-Augmented Generation (RAG)
* Retrieves relevant notes before generating responses
* Displays source notes used to answer questions

---

## Tech Stack

### Frontend

* React
* React Router
* Tailwind CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

### AI

* Google Gemini API
* Vector Embeddings
* MongoDB Atlas Vector Search
* Retrieval-Augmented Generation (RAG)

---

## Project Structure

```text
frontend/
├── src/
│   ├── components/
│   ├── contexts/
│   ├── pages/
│   ├── services/
│   └── App.jsx

backend/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
└── server.js
```

---

## How RAG Works

1. User asks a question in the AI chat panel.
2. The backend generates an embedding for the question.
3. Hybrid search retrieves the most relevant notes using:

   * Keyword Search
   * Vector Search
4. Retrieved notes are injected into the LLM prompt.
5. Gemini generates an answer grounded in the retrieved notes.
6. The response and supporting source notes are returned to the frontend.

---

## Installation

### Clone the repository

```bash
git clone https://github.com/Akshat1307/ai-personal-knowledge-base.git
```

### Install dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

---

## Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key
```

---

## Running the Project

### Start Backend

```bash
cd backend
npm run dev
```

### Start Frontend

```bash
cd frontend
npm run dev
```

---

## Future Improvements

* Conversation history and memory
* Streaming AI responses
* Chunk-based indexing
* Hybrid search reranking
* AI-generated summaries
* Related note recommendations
* Export and import notes
* File and PDF support

---

## Learning Outcomes

This project demonstrates practical implementation of:

* Full Stack Web Development
* Authentication and Authorization
* REST API Design
* MongoDB Data Modeling
* Vector Embeddings
* Semantic Search
* Hybrid Search
* Retrieval-Augmented Generation (RAG)
* Large Language Model Integration
* Responsive Frontend Development

---

##





##  Author

**Akshat Chawla**

B.Tech Computer Science Engineering




