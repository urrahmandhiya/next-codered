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

Start the development server:

```bash
pnpm dev
```

Open http://localhost:3000 in your browser to view the application. The page will auto-update as you modify files in the app/ directory.

## Game Flow & Setup Requirements

The game lobby and room settings adhere to strict gameplay and synchronization rules to guarantee fair distribution of roles before the game starts.

### 1. Room Capacity
* **Minimum Capacity:** 4 players.
* **Maximum Capacity:** 25 players.
* *Controls:* The capacity is managed via custom numeric steppers. The adjustment buttons automatically disable when reaching the minimum (4) or maximum (25) limit.

### 2. Role Distribution & Synchronization
* **Available Roles:** Villagers and Werewolves.
* **Sum Consistency:** The total number of assigned roles (Villagers + Werewolves) **must always exactly equal** the room's maximum player capacity.
* **Werewolf Ratio Cap:** Werewolves are capped at **30% of the total room capacity** (rounded down).
  * *Example:* In a 10-player room, the Werewolf count cannot exceed 3 (30% of 10).
* **Auto-Synchronization:**
  * Adjusting the maximum player capacity dynamically recalculates role limits and scales counts.
  * Adjusting the **Werewolf** count automatically increases/decreases the **Villager** count to maintain the sum, and vice-versa.
  * Buttons are intelligently disabled when either role hits its respective ceiling (e.g., Werewolf reaching its 30% cap) or floor.

### 3. Permissions & Host Privileges
* **Host:**
  * Has full access to the Room Settings modal.
  * Can change the room capacity, distribute roles, and start the game.
  * Has access to host-specific actions, such as kicking players from the waiting room.
* **Guest Players:**
  * View-only access to the room configuration (room capacity and role numbers are locked).
  * Can use the Room Settings modal exclusively to update their own player name.

