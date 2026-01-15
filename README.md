# MAIA - Mental Health AI Assistant

<p align="center">
  <strong>Your compassionate AI companion for mental wellness</strong>
</p>

MAIA is a web-based AI-powered mental health support platform that provides 24/7 emotional support in a safe, private space. It features a patient-facing AI chat interface and a therapist-facing dashboard for professional oversight.

> ⚠️ **Important Disclaimer**: MAIA does not diagnose conditions, replace professional therapy, or provide medical advice. It is designed as a supportive tool to complement professional mental health care.

## ✨ Features

### AI-Powered Capabilities (via Backboard)

MAIA leverages [Backboard](https://backboard.dev) to provide advanced AI features ([Some Detailed Flows](https://drive.google.com/file/d/1bAFEV2qTIjz1WuIk6ILydJkaT9pHPNpw/view?usp=sharing)):

#### 🧠 Stateful Memory
- **Persistent Conversations** - MAIA remembers context across sessions, maintaining continuity in therapeutic conversations
- **Per-User Assistants** - Each patient gets a dedicated AI assistant with isolated memory and context

#### 📚 RAG (Retrieval-Augmented Generation)
- **CBT Knowledge Base** - AI responses are grounded in Cognitive Behavioral Therapy literature and best practices
- **Therapist Notes Integration** - Therapists can upload patient notes that inform MAIA's responses for personalized support

#### 🛠️ Custom Tools
- **Guardian AI** - Real-time detection of concerning patterns or crisis indicators, automatically notifying therapists

### For Patients
- 💬 **Empathetic AI Chat** - 24/7 access to a supportive AI companion that remembers your journey
- 📜 **Chat History** - Full access to previous conversations
- 🧘 **CBT-Informed Support** - Responses guided by evidence-based therapeutic techniques
- 👨‍⚕️ **Therapist Connection** - View assigned therapist information
- 🔗 **Assignment Management** - Accept or deny therapist assignment requests

### For Therapists
- 📊 **Patient Dashboard** - Centralized view of all assigned patients
- 📝 **Session Notes** - Upload and manage patient notes that enhance AI personalization
- 📋 **Weekly Summary Generation** - AI-generated summaries of patient conversations and progress
- 🚨 **Safety Alerts** - Real-time notifications when the AI detects concerning patterns or crisis indicators (custom tool integration)
- 📧 **Patient Assignment** - Request assignment to patients via email

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.13+)
- **Database**: SQLite with [SQLAlchemy](https://www.sqlalchemy.org/) (async)
- **AI Integration**: Backboard SDK
- **Authentication**: JWT (PyJWT) with OAuth2
- **Password Hashing**: Argon2 (pwdlib)

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) 15 (App Router)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Forms**: React Hook Form with Zod validation
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites
- Python 3.13 or higher
- Node.js 18 or higher
- npm, yarn, pnpm, or bun

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   # Using uv
   uv sync
   
   ```

3. Set up environment variables:
   ```bash
   # Create a .env file in the backend directory
   echo "BACKBOARD_API_KEY=your_api_key_here" > .env
   ```

4. Run the development server:
   ```bash
   uv run uvicorn api.main:app --reload
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables (optional):
   ```bash
   # Create a .env.local file
   echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000" > .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## � Future Improvements

- [ ] Find a solution to uploading RAG documents for each user individually
- [ ] Fix the bug where threads/assistants get created for therapist accounts

## �📄 License

This project is under the GNU AFFERO GENERAL PUBLIC LICENSE.

## 🤝 Contributing

Please open an issue.

---

<p align="center">
  Made with ❤️ for mental wellness
</p>
