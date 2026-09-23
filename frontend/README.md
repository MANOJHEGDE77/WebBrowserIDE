# 🖥️ WebBrowserIDE — Frontend Application

Next.js 16 full-stack web application for **WebBrowserIDE**, featuring an **In-Browser Hardware Code Lab (Monaco Editor)** and the **DigiComp AI Shopping Assistant**.

---

## ⚡ Tech Stack

- **Framework**: [Next.js 16.3](https://nextjs.org/) (App Router)
- **UI & Components**: [React 19](https://react.dev/), [Lucide React](https://lucide.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Code Editor**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) (VS Code Editor in browser)
- **Local AI Engine**: [Ollama](https://ollama.ai/) with `gemma3:270m`
- **Database**: [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Key Pages & Features

| Route | Description |
| :--- | :--- |
| `/` | E-Commerce store homepage with component catalog, search, and category filters. |
| `/hardware-lab` | **Hardware Code Lab**: In-browser IDE using Monaco Editor for Arduino Uno, Nano, and ESP32 DevKit sketches. |
| `/ai` | Dedicated AI assistant chat interface with multi-turn conversation sidebar. |
| `/products/[id]` | Component detail page with specs, pinout info, and add-to-cart. |
| `/cart` | Shopping cart drawer and checkout flow. |
| `/login` & `/signup` | User authentication pages. |

---

## 🔌 API Routes

- `POST /api/ai/chat`: Streaming & multi-turn chat pipeline with local Ollama model.
- `GET/POST /api/ai/conversations`: Conversation history persistence.
- `GET /api/hardware/devices`: Returns microcontroller board specs (clock speed, memory, baud rates).
- `POST /api/hardware/compile`: Simulates C++ firmware compilation and reports memory metrics.
- `GET /api/products`: Full catalog search and filter endpoint.

---

## 👨‍💻 Developer

Developed by **[Manoj Hegde](https://github.com/MANOJHEGDE77)**.
