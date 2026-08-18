# next-codered

Mafia/Werewolf-like web based game with cyber theme, built with Next.js

## Tech Stack

* **Framework:** Next.js 16 (App Router) & React 19
* **Styling/Components:** Tailwind, shadcn base/ui, and `next-themes` for dark mode
* **Data Fetching:** SWR (polling)
* **Database:** Upstash Redis

## Prerequisites


* Node.js (v20 or higher recommended)
* [pnpm](https://pnpm.io/)
* An [Upstash](https://upstash.com/) account for a Redis database

## Getting Started

### 1. Environment Variables

Use the `.env.example` file in the root of the project and add your Upstash Redis credentials.


### 2. Installation

Install the project dependencies using pnpm:

```bash
pnpm install
```

### 3. Development

Start the development server:

```bash
pnpm dev
```

### 4. Local Multiplayer Testing

A minimum number of players is required to start a game. To simulate multiple players locally, use isolated browser sessions:

* Firefox: Multi-Account Containers
* Chrome/Edge: Separate profiles
* Multiple browser usage

Incognito may not work (only for one player), since they share the same cookie jar, so opening more than one will overwrite another session.

## Core Mechanics

A public GDD will be up soon!
