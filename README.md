# LevelUp

**LevelUp** is a dark-themed, gamified AI Gym, Workout & Nutrition Tracker built with **React Native (Expo)** and a **Node.js + Express** backend. It launches directly with zero login/signup friction, persists all user progress locally via `AsyncStorage`, and includes a domain-bounded AI Coach and Interactive Live Workout Mode.

---

## Project Structure

```text
LevelUp/
├── backend/
│   ├── .env                 # Server environment variables (ignored by git)
│   ├── package.json         # Express + Google GenAI dependencies
│   └── server.js            # Domain-bounded REST API, Gemini 3.x & fallback engine
├── levelup-app/
│   ├── .env.example         # Optional Expo API URL override template
│   ├── App.js               # Root entry & hydration splash gate
│   ├── app.json             # Expo app metadata ("LevelUp")
│   ├── package.json         # Expo / React Native dependencies
│   └── src/
│       ├── components/
│       │   ├── Dashboard.js         # 6-tab main dashboard shell + header badges
│       │   ├── OnboardingFlow.js    # 20-step dark-theme onboarding flow
│       │   ├── WheelPicker.js       # Vertical snap-wheel picker
│       │   └── tabs/
│       │       ├── OverviewTab.js   # XP/Level, Ranks, Quests, Water, Attributes & Milestones
│       │       ├── WorkoutTab.js    # AI/Standard plans, Live Workout Player & History
│       │       ├── DietTab.js       # AI meal plan & Veg/Non-Veg presets
│       │       ├── CaloriesTab.js   # BMR/TDEE targets, Indian presets & daily log
│       │       ├── FriendsTab.js    # Username friends & daily Snap streaks
│       │       └── ChatTab.js       # Domain-bounded LevelUp AI Coach chat
│       ├── constants/
│       │   └── fitnessData.js       # Ranks, milestones, splits, presets & defaults
│       ├── context/
│       │   └── FitTrackContext.js   # Global state, XP awards, AsyncStorage & midnight reset
│       ├── services/
│       │   └── api.js               # Dynamic backend URL & timeout-safe fetch
│       ├── styles/
│       │   └── theme.js             # Unified LevelUp midnight-navy StyleSheet
│       └── utils/
│           ├── fitnessMath.js       # Mifflin-St Jeor BMR/TDEE, BMI, Level/XP & stats math
│           └── localFallbacks.js    # Offline plan, chat fallback & domain guardrail
└── .gitignore
```

---

## Core Features

### 1. Guided Onboarding Flow (20 Steps)
- **Profile & Goals**: Gender, motivation, primary goal, referral source, multi-select focus areas, fitness level, and activity level.
- **Interactive Snap-Wheel Pickers**: Vertical wheel selectors for Age (`14–75`), Height (`cm` / `ft-in` toggle), Current Weight (`kg` / `lbs` toggle), and Target Weight (`kg` / `lbs` toggle).
- **Safety & Schedule**: Health/joint considerations (`None`, `Knee`, `Hip Joints`, `Back or Hernia`, `Arms and Shoulders`, `Cant Do Jumps`), equipment access, weekly frequency slider (`2x–6x`), workout days selector, and Smart Reminders toggle.
- **Analytics & Preview**: Weight progression curve, BMI spectrum bar, Mifflin-St Jeor daily calorie & macro breakdown (`Protein`, `Carbs`, `Fat`), personalized hydration/session targets, weekly workout calendar grid, animated plan generation status, capacity comparison, and branded **LevelUp** welcome screen.

### 2. Main Dashboard (6 Interactive Tabs)
1. **Overview**:
   - **Level & XP System** (`Lv. X`, `150 XP` per level) + **Consistency Ranks** (`Beginner` → `Bronze` → `Silver` → `Gold` → `Platinum` → `Legend`).
   - **Daily Quests & Water Tracker**: Track daily workout completion, meals logged, and interactive `−` / `+1` water cups against your hydration target.
   - **Performance Attributes**: Live `0–100` bars for `Strength`, `Stamina`, `Nutrition`, and `Discipline`.
   - **Milestones & Demo Controls**: 6 unlockable streak badges (`3`–`100` days), profile summary, AI plan regeneration, and `+1 Day` / `+5 Days` / `Reset` demo controls.
2. **Workout Plan & Live Workout Player**:
   - Switch between **LevelUp AI Plan** (joint-safe & equipment-tailored) and **Standard Splits** (`Push/Pull/Legs`, `Full Body Routine`, `Upper/Lower Split`, `Fat Loss HIIT` × `Beginner` / `Intermediate` / `Advanced`).
   - **Start Live Workout Session**: Elapsed workout clock, per-set checkboxes, weight (`kg`) inputs, automatic **Rest Countdown Timer** (`-15s`, `+15s`, `Skip Rest`), XP rewards, and **Recent Workout History**.
3. **Diet Plan**: Toggle between **AI Meal Plan** and **Preset Plans** (`Weight Loss`, `Maintain`, `Muscle Gain` × `Vegetarian` / `Non-Veg`), with instant `+ Log Meal` (`+10 XP`) and AI coaching tips.
4. **Calories**: Mifflin-St Jeor calorie & macro targets, progress bar, 8 Indian food presets (`Roti`, `Dal`, `Paneer`, `Boiled Eggs`, `Chicken Breast`, `Rice`, `Oats`, `Whey Protein`), custom food logger, and automatic midnight reset.
5. **Friends**: Local friend list by username with daily `Send Snap` streaks (`+15 XP`, resets at midnight).
6. **AI Coach**: Domain-bounded chat connected to `POST /api/chat` with full profile context, multi-turn history, quick-prompt chips, server/local status pill, and offline fallback.

---

## AI Safety & Domain Guardrails

LevelUp AI is strictly restricted to **gym workouts, exercise safety, nutrition/diet, calories/macros, hydration, recovery, and LevelUp progress**:
- **Client & Server Pre-Filter**: Off-topic prompts (coding, homework, politics, movies, sports scores, trivia, etc.) and prompt-injection/jailbreak attempts are blocked before calling Gemini, saving API quota.
- **Input Bounding**: Chat messages are capped at `500` characters (`MAX_CHAT_MESSAGE_LENGTH` / `maxLength={500}`).
- **System Instruction & Offline Guard**: Both Gemini `systemInstruction` and the local fallback enforce fitness-only coaching and advise consulting a doctor/physiotherapist for acute medical issues.

---

## Tech Stack

- **Frontend**: Expo (`^58.0.0`), React (`19.3.0`), React Native (`0.88.1`), `@react-native-async-storage/async-storage` (`^2.1.0`)
- **Backend**: Node.js (ESM), Express (`^4.19.2`), `cors` (`^2.8.5`), `dotenv` (`^16.4.5`), `@google/genai` (`^1.0.0`)

---

## Getting Started

### 1. Backend Setup

```powershell
cd "D:\My Creation\LevelUp\backend"
npm install
```

Configure `backend/.env`:

```env
GEMINI_API_KEY=your_google_gemini_api_key
PORT=3000
# Optional: pin a specific model (defaults to gemini-3.8-flash / gemini-3.5-flash-lite / gemini-3-flash)
# GEMINI_MODEL=gemini-3.5-flash-lite
```

> **Note:** The backend automatically queries `ListModels` to discover active Gemini 3.x models on your key, applies per-request timeouts (`9s`), and falls back cleanly to its intelligent local engine whenever the API key is missing, rate-limited, or offline.

Start the server:

```powershell
npm start
```

### 2. Mobile App Setup

```powershell
cd "D:\My Creation\LevelUp\levelup-app"
npm install
npx expo start --clear
```

- **Backend URL Auto-Detection**: The app derives `http://<metro-host>:3000` automatically on LAN (ignoring tunnel hosts like `exp.direct`). To set it explicitly, copy `.env.example` to `.env` and define `EXPO_PUBLIC_API_URL`.

---

## API Endpoints

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns backend status, `aiConfigured`, and `activeModel` |
| `POST` | `/api/generate-plan` | Generates personalized `{ workouts, diet, advice }` JSON from user profile |
| `POST` | `/api/chat` | Domain-bounded AI Coach reply with optional multi-turn `history` |
