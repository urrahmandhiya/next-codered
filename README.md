# next-codered

Werewolf-like web based game with cyber theme, built with Next.js with Redis

## Tech Stack

This project leverages a modern React ecosystem:

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router) & React 19
* **Styling:** Tailwind CSS v4, [base/ui](https://ui.shadcn.com/), and `next-themes` for dark mode
* **Components:** `@base-ui/react`, Radix UI (via shadcn), and Lucide React icons
* **Forms & Validation:** React Hook Form + Zod
* **Data Fetching:** SWR
* **Database/Caching:** Upstash Redis
* **Notifications:** Sonner

## Prerequisites

Before you begin, ensure you have the following installed:
* Node.js (v20 or higher recommended)
* [pnpm](https://pnpm.io/)
* An [Upstash](https://upstash.com/) account for a Redis database

## Getting Started

### 1. Environment Variables

Use the `.env.example` file in the root of the project and add your Upstash Redis credentials. The project will fail to connect without these.


### 2. Installation

Install the project dependencies using pnpm:

```bash
pnpm install
```

### 3. Development

Start the development server:h

```bash
pnpm dev
```

Open http://localhost:3000 in your browser to view the application. The page will auto-update as you modify files in the app/ directory.
