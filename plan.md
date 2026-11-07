# WorkConnect Backend Implementation Plan (Express.js + Supabase + Gemini AI)

This plan outlines how we will build the backend for **WorkConnect** using **Express.js**, **Supabase**, and **Google Gemini AI**. 

The architecture is kept **clean, straightforward, and easy to explain** (e.g. during project presentations or code defenses) without confusing boilerplate.

---

## 1. High-Level Architecture

```
React Frontend (Vite)  <──── Chatbot2.jsx sends user message
    │
    │  HTTP Requests (fetch)
    ▼
Express.js Server (Node.js)
    │                  │
    │  Supabase SDK    │  @google/generative-ai (Gemini SDK)
    ▼                  ▼
Supabase DB       Google Gemini API (Free)
(workers table)   (AI chatbot responses)
```

### Why this setup?
* **Express.js**: Acts as the backend traffic controller. It receives requests from your frontend (`/api/workers`, `/api/auth/login`, `/api/chat/message`), checks data, and returns clean JSON responses.
* **Supabase**: Serves as your managed cloud database (PostgreSQL). It stores user accounts and verified artisans securely with easy API access.
* **Google Gemini AI**: Powers the chatbot so it gives real, intelligent answers instead of just keyword matching. Free tier via Google AI Studio — no credit card needed.

---

## 2. Recommended Folder Structure

We will create a clean `server` folder inside your project workspace:

```
WorkConnect/
├── src/                  (Your current React Frontend)
├── plan.md               (This file)
├── server/               (Our new Express Backend)
│   ├── .env              (Database keys & port - keep secret)
│   ├── .env.example      (Template for environment variables)
│   ├── package.json      (Backend dependencies)
│   ├── index.js          (Server entry point)
│   ├── config/
│   │   └── supabase.js   (Connects to your Supabase project)
│   ├── controllers/
│   │   ├── authController.js   (Simple login & signup logic)
│   │   ├── workerController.js (Logic for getting & searching workers)
│   │   └── chatController.js   (Calls Gemini AI, returns smart response)
│   └── routes/
│       ├── authRoutes.js       (Endpoints: /api/auth/...)
│       ├── workerRoutes.js     (Endpoints: /api/workers/...)
│       └── chatRoutes.js       (Endpoints: /api/chat/...)
```

---

## 3. Database Schema (Supabase Tables)

In your Supabase dashboard, we only need **two simple tables** to start:

### Table 1: `users`
Stores registered customers and artisans.
* `id`: UUID (Primary Key, automatically generated)
* `full_name`: Text (e.g., "Chimdimma Vanessa")
* `email`: Text (Unique)
* `password`: Text (Hashed password for security)
* `role`: Text (`"customer"` or `"artisan"`)
* `phone`: Text
* `created_at`: Timestamp

### Table 2: `workers`
Stores artisan profiles shown on the chatbot and worker cards.
* `id`: BigInt / UUID (Primary Key)
* `user_id`: UUID (Links to `users.id`, optional)
* `name`: Text (e.g., "Ben Okafor")
* `skill`: Text (e.g., "Electrician", "Plumber")
* `location`: Text (e.g., "Nsukka", "Enugu")
* `phone`: Text (e.g., "+234 803 123 4567")
* `rating`: Numeric (e.g., 4.8)
* `reviews`: Integer (e.g., 24)
* `image`: Text (URL of profile image)
* `verified`: Boolean (default `true`)
* `about`: Text (Short artisan description)
* `created_at`: Timestamp

---

## 4. Implementation Steps (Phase by Phase)

### Phase 1: Setup & Environment
1. Initialize the `server/` directory and `package.json`.
2. Install these packages:
   * `express`: Web server framework.
   * `@supabase/supabase-js`: Official Supabase library.
   * `dotenv`: Loads configuration keys from `.env`.
   * `cors`: Allows your Vite frontend (`http://localhost:5173`) to make requests to the backend (`http://localhost:5000`).
   * `@google/generative-ai`: Official Google Gemini SDK.
3. Create `.env` file with your `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `GEMINI_API_KEY`.

### Phase 2: Database Connection
* Create `server/config/supabase.js`.
* It takes only 5 lines of code to initialize the Supabase client:
  ```javascript
  import { createClient } from '@supabase/supabase-js';
  import dotenv from 'dotenv';
  dotenv.config();

  export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  ```

### Phase 3: Worker API Routes
Build routes that your existing frontend components (`Chatbot2.jsx` and `WorkerProfileCards.jsx`) can fetch:
* `GET /api/workers` — Fetch all workers.
* `GET /api/workers/search?skill=...&location=...` — Filter workers dynamically for the chatbot.
* `GET /api/workers/:id` — Fetch single artisan profile for the in-chat profile page.
* `POST /api/workers/upload` — Upload artisan profile photo or portfolio image to Supabase Storage.
* `POST /api/workers` — Create a new artisan profile (stores photo URL and portfolio).

### Phase 4: Authentication API Routes
Build routes for user login and registration:
* `POST /api/auth/register` — Create a new user in Supabase (`CSignupPage` & `WSignupPage`).
* `POST /api/auth/login` — Validate user credentials and return user info (`LoginPage`).

### Phase 5: AI Chatbot Integration — Google Gemini
This phase wires up the real intelligence behind your chatbot.

#### Why Gemini?
* **Free** — Get your API key from [Google AI Studio](https://aistudio.google.com) with no credit card.
* **Simple SDK** — One npm package: `@google/generative-ai`.
* **Fast** — The `gemini-1.5-flash` model is very quick and ideal for chatbot responses.
* **Easy to explain** — "We send the user's message to Google's AI, it thinks and responds, we show the answer." — that's the whole thing.

#### How it will work (step by step):
1. User types a message in `Chatbot2.jsx` (e.g. *"I need a plumber in Nsukka"*).
2. Frontend sends a **POST** request to `http://localhost:5000/api/chat/message` with the message and chosen language (Pidgin or English).
3. Express receives it in `chatController.js`.
4. The controller builds a **prompt** for Gemini that includes:
   - The user's message
   - The language preference (Pidgin or English)
   - A short instruction like: *"You are WorkConnect AI, an artisan finder for Nigeria. Help the user find skilled workers."*
5. Gemini processes it and returns a smart reply.
6. The controller also searches Supabase for matching workers (skill + location).
7. Express sends back **both** — the AI text reply + the list of matching workers.
8. Frontend shows the AI message in the chat bubble, and worker cards below it.

#### New API Endpoint:
* **`POST /api/chat/message`**
  * **Request body:** `{ message: "I need a plumber", language: "pidgin" }`
  * **Response:** `{ reply: "I don find 3 plumbers for Nsukka...", workers: [...] }`

#### New Files:
* `server/controllers/chatController.js` — Builds the Gemini prompt, calls the API, searches Supabase, returns combined response.
* `server/routes/chatRoutes.js` — Registers the `POST /api/chat/message` endpoint.

#### New Environment Variable (add to `.env`):
```
GEMINI_API_KEY=your_gemini_api_key_from_aistudio
```

#### How the Prompt Will Look (inside chatController.js):
```
You are WorkConnect AI — a helpful assistant that connects Nigerians 
with verified local artisans and skilled workers. 
Respond in [Pidgin / English] based on the user's language preference.
Keep answers short, friendly, and practical.

User said: "I need a plumber in Nsukka"
```

> NOTE: The language toggle in the chatbot (Pidgin/English) will be sent with every message so Gemini replies in the right dialect automatically.

> ALTERNATIVE FREE AI OPTIONS (if Gemini API is unavailable):
> - Groq API (free tier): Very fast, uses Llama 3 or Mixtral. Get key at groq.com
> - OpenRouter (free tier): Access multiple free models. Get key at openrouter.ai
> Both work nearly identically — same fetch/POST pattern, just a different URL and API key.

---

### Phase 6: Connecting Frontend to Backend
Replace mock data in the React frontend:
* In `LoginPage.jsx`: Submit email & password to `http://localhost:5000/api/auth/login`.
* In `Chatbot2.jsx` & `WorkerProfileCards.jsx`: Fetch real workers from `http://localhost:5000/api/workers`.
* In `Chatbot2.jsx`: Replace the local keyword matching with a `fetch` call to `http://localhost:5000/api/chat/message` — sending the user's message and language, getting back the AI reply + matched workers.

---

## 5. Terminal Commands to Run (When You Are Ready)

> NOTE: Run these commands yourself when you are ready. No commands will run automatically.

```powershell
# 1. Create server directory and enter it
mkdir server
cd server

# 2. Initialize node project
npm init -y

# 3. Install all dependencies (including Gemini AI SDK)
npm install express @supabase/supabase-js dotenv cors @google/generative-ai

# 4. Install nodemon for easy development (auto-restarts server on save)
npm install -D nodemon
```

---

## 6. What We Need Before Writing Code

### From Supabase:
1. A Supabase project created on [supabase.com](https://supabase.com).
2. Your **Project URL** (e.g. `https://xyzcompany.supabase.co`).
3. Your **Anon / Public API Key** (found in Project Settings → API).

### From Google AI Studio (for Gemini):
4. A free Gemini API key from [aistudio.google.com](https://aistudio.google.com).
   - Sign in with your Google account → click **"Get API Key"** → **"Create API Key"** → copy it.
   - No credit card required. Free tier is enough for this project.

Both keys go into `server/.env` like this:
```
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

---

## 7. Summary of All Backend Files to Create

| File | Purpose |
|------|---------|
| `server/package.json` | Backend dependencies & start scripts |
| `server/.env` | Secret keys (never commit this to GitHub) |
| `server/.env.example` | Safe template to share with teammates |
| `server/index.js` | Main Express server entry point |
| `server/config/supabase.js` | Supabase client setup |
| `server/controllers/workerController.js` | Get, search, add workers |
| `server/routes/workerRoutes.js` | /api/workers endpoints |
| `server/controllers/authController.js` | Register & login logic |
| `server/routes/authRoutes.js` | /api/auth endpoints |
| `server/controllers/chatController.js` | Gemini AI call + worker search |
| `server/routes/chatRoutes.js` | /api/chat/message endpoint |

