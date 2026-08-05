markdown
# Gryt Saturday Crew

A modern web application built with React, TypeScript, Vite, and Supabase.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite
- **UI & Styling:** Tailwind CSS, shadcn/ui
- **Backend & Database:** Supabase
- **Package Manager & Runtime:** Bun
- **Testing:** Playwright
- **Code Quality:** ESLint, Prettier

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Bun](https://bun.sh/) (or Node.js v18+)
- [Git](https://git-scm.com/)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/nickmerich/gryt-saturday-crew.git](https://github.com/nickmerich/gryt-saturday-crew.git)
   cd gryt-saturday-crew

```

2. **Install dependencies:**
```bash
bun install

```


3. **Configure Environment Variables:**
Copy the development environment template to create your `.env` file:
```bash
cp .env.development .env

```


Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=[https://your-supabase-project.supabase.co](https://your-supabase-project.supabase.co)
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

```


4. **Start the local development server:**
```bash
bun dev

```



---

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `bun dev` | Starts the Vite development server |
| `bun run build` | Compiles and builds the production bundle |
| `bun run preview` | Previews the production build locally |
| `bun run lint` | Runs ESLint to check for code quality issues |
| `bun run test` | Executes Playwright end-to-end tests |

---

## 📁 Project Structure

```text
gryt-saturday-crew/
├── .github/             # CI/CD workflows and actions
├── e2e/                 # End-to-end test suites
├── public/              # Static assets and icons
├── scripts/             # Utility and automation scripts
├── src/                 # Application source code (components, hooks, pages, lib)
├── supabase/            # Supabase config, migrations, and edge functions
├── tests/               # Unit and component tests
├── .env.development     # Environment variable template
├── components.json      # shadcn/ui configuration
├── playwright.config.ts # Playwright testing configuration
└── vite.config.ts       # Vite project configuration

```

---

## 🧪 Testing

To run the E2E test suite using Playwright:

```bash
bun x playwright test

```

To inspect test results in the interactive UI mode:

```bash
bun x playwright test --ui

```

```

```
