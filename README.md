# 🚀 Innomate

Final Year Project

---

## 👥 Team Members

* Rashmitha Patnana
* Sahithi Kumari Burada
* Bala Sai Ram Goli
* Sandilya Tamozhna

---

## 📌 Project Description

*(To be updated)*

Innomate is a smart platform designed to help users analyze and evaluate startup ideas using AI-driven insights. The system provides structured feedback on different aspects of a business idea, helping users understand feasibility, risks, market potential, and strategic improvements.

More detailed description will be added later.

---

## 🧠 Core Features

* AI-based **Idea Analysis**
* **Market Trend Insights**
* **Competitor Analysis**
* **SWOT Analysis**
* **Risk & Feasibility Evaluation**
* **Budget Estimation**
* **Smart Recommendations**
* **Pitch Deck Generation**
* **Automated Idea Reports**

---

## 🏗️ Project Architecture

The project follows a **Full Stack Architecture**:

```
Frontend (Next.js + React)
        │
        │ API Calls
        ▼
Backend (FastAPI)
        │
        │ AI Processing
        ▼
AI Models & Services
        │
        ▼
Database (Supabase / PostgreSQL)
```

---

## 🖥️ Tech Stack

### Frontend

* Next.js
* React
* Tailwind CSS

### Backend

* FastAPI
* Python
* SQLAlchemy

### Database

* Supabase (PostgreSQL)

### AI Integration

* Groq API / LLM Models

---

## 📂 Project Structure

```
innomate
│
├── backend
│   ├── app
│   │   ├── core
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   └── utils
│   ├── requirements.txt
│   └── start.bat
│
├── frontend
│   ├── app
│   ├── src
│   ├── public
│   └── package.json
│
├── docs
├── README.md
└── .gitignore
```

---

## ⚙️ How to Run the Project

### 1️⃣ Clone the Repository

```
git clone https://github.com/sahithiburada/innomate.git
cd innomate
```

---

### 2️⃣ Run Backend

```
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend will run on:

```
http://127.0.0.1:8000
```

---

### 3️⃣ Run Frontend

```
cd frontend
npm install
npm run dev
```

Frontend will run on:

```
http://localhost:3000
```

## 🔐 Environment Variables

This project uses environment variables for API keys and database configuration.

The repository includes **example environment files** to show the required variables.

### Backend Setup

1. Copy the example file:

```
cp backend/.env.example backend/.env
```

2. Fill in the required values:

```
GROQ_API_KEY=
SUPABASE_DATABASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

---

### Frontend Setup

1. Copy the example file:

```
cp frontend/.env.example frontend/.env.local
```

2. Fill in the required values:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_BACKEND_URL=
```

---

⚠️ **Important:**
The actual `.env` files are ignored by Git and **must not be committed** to the repository to keep API keys and credentials secure.


## 📊 Future Enhancements

* Enhanced AI models for deeper idea evaluation
* More detailed financial projections
* Investor-ready pitch deck generation
* Real-time market data integration

---

## 📜 License

This project is developed as part of a **Final Year Engineering Project**.
