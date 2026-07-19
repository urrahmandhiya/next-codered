# Code Red — Game Flow

> **Terminology Note:** UI-facing labels differ from server-side phase keys. This document uses the UI terms. Server keys are shown in parentheses.

---

## Phase Cycle Overview

```
Waiting Room
    ↓
Game Start Countdown  (starting)
    ↓
┌─────────── GAME LOOP ─────────────────────────────────────────────────────────┐
│                                                                               │
│   Uptime  ──────────────────────→  Security Clearance Hearing                │
│  (day phase)                      (hangVote → hangVoteCount → hangVoteResult) │
│      ↑                                       ↓                               │
│      │                           Downtime / Silent Protocol                  │
│      │                           (night phase — concurrent by role):         │
│      │                             • Good Side: Q&A Signal Quests            │
│      │                             • Bad Side: Target Selection (Kill Vote)  │
│      │                                       ↓                               │
│  Incident Report ←───────────────────────────┘                               │
│  (transition screen)                                                         │
│      │                                                                       │
│      └──────────────────── repeat until game ends ──────────────────────────┘
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
    ↓
End Screen  (endGame: goodEnd | badEnd)
```

---

## Phase Breakdown

### 1. Waiting Room
- **Server state:** `roomStatus = "waiting"`
- **Who sees it:** All players before game starts
- **Actions:** Host can start the game once minimum players have joined
- **Duration:** Until host manually starts

---

### 2. Game Start Countdown — `INITIALIZING PROTOCOL`
- **Server phase key:** `starting`
- **UI label:** `INITIALIZING PROTOCOL`
- **Who sees it:** All alive players
- **What happens:**
  - Each player is secretly assigned a role: `villager` or `werewolf`
  - Role is revealed with identity card animation
  - Countdown runs (default ~10s), then game enters first Downtime or Uptime cycle
- **Theme:** Cyan / `starting` PhaseLayout

---

### 3. Uptime — `SYSTEM ONLINE`
- **Server phase key:** `day`
- **UI label:** `SYSTEM ONLINE` / `UPTIME`
- **Who sees it:** All alive players (dead players see spectator view)
- **What happens:**
  - Players discuss and deduce who the werewolves are
  - A countdown timer runs for the discussion window
  - At the end, transitions to Security Clearance Hearing
- **Theme:** Cyan — `uptime` PhaseLayout (same dark base with cyan radial gradient as `bg-cyber-room`)
- **Duration:** Configurable (e.g. 60–120s in real game)

---

### 4. Security Clearance Hearing — `SECURITY CLEARANCE HEARING`
- **Server phase keys:** `hangVote` → `hangVoteCount` → `hangVoteResult`
- **UI labels:** `SECURITY CLEARANCE HEARING` → *(counting)* → `SECURITY CLEARANCE RESULT`
- **Who sees it:** All players — alive players can vote; dead players see observer mode
- **What happens:**
  - Players cast a vote to eliminate a suspected werewolf (`hangVote`)
  - Default selection for all players is `"none"` (Abstain) to prevent uninitialized votes
  - `hangVoteCount` = brief counting phase
  - `hangVoteResult` = **Security Clearance Result** — reports ONLY the eliminated player's name & role (`CLEARANCE DENIED`), or `NONE` if no consensus reached
- **Theme:** Cyan — same as Uptime

---

### 5. Downtime — `SYSTEM MAINTENANCE` / `SILENT PROTOCOL`
- **Server phase key:** `night` (and associated bad side kill vote actions)
- **UI label:** `SYSTEM MAINTENANCE` / `SILENT PROTOCOL`
- **Who sees it:** All alive players (content branched concurrently by role side):
  - **Good Side (Villagers):** Interactive Q&A Signal Quests (`downtime-phase.tsx`)
  - **Bad Side (Werewolves):** Target Selection / Silent Protocol (`kill-vote-phase.tsx` or `downtime-bad-phase.tsx`)
- **What happens:**
  - Runs concurrently for both sides during the single Downtime window
  - Villagers solve signal quests to earn system clues
  - Werewolves secretly cast target votes to eliminate a villager
  - Timer: overall phase countdown (`SYSTEM MAINTENANCE`, 60s)
- **Theme:** Deep rose / red — `downtime` PhaseLayout

---

### 6. Incident Report — `INCIDENT REPORT`
- **Server phase key:** *(transition screen after Downtime → Uptime)*
- **UI label:** `INCIDENT REPORT`
- **Who sees it:** All players
- **What happens:**
  - Debrief transition screen exclusively revealing bad side downtime attacks (who was compromised or hacked at night, or `NONE`)
  - Hearing vote outcomes are separately reported in **Security Clearance Result**
  - A short countdown, then transitions back to Uptime (`day`)
- **Theme:** Cyan — `uptime` PhaseLayout
- **Duration:** ~5–8s (auto-advance)

---

### 7. End Screen
- **Server state:** `endGame: "goodEnd" | "badEnd"`
- **Who sees it:** All players
- **What happens:**
  - Reveals all roles and final statuses
  - Shows which side won
  - Option to return to lobby

---

## Server Phase Key Reference

| UI Name              | Server `phase` key(s)                        | UI Theme    |
|----------------------|-----------------------------------------------|-------------|
| Waiting Room         | `roomStatus = "waiting"`                     | Default     |
| Initializing Protocol| `starting`                                   | Cyan        |
| Uptime               | `day`                                         | Cyan        |
| Security Clearance Hearing | `hangVote`, `hangVoteCount`             | Cyan        |
| Security Clearance Result  | `hangVoteResult`                        | Cyan        |
| Downtime (Concurrent)| `night` (Good: Q&A Quiz / Bad: Target Pick)   | Deep Red    |
| Incident Report      | `incidentReport`                             | Cyan        |
| End Screen           | `endGame` set                                 | Default     |

---

## UI Component Map

| Phase                 | Component / File                                                 |
|-----------------------|------------------------------------------------------------------|
| Waiting Room          | [waiting-room.tsx](file:///d:/Dev/hobby/me/code-red/components/room/waiting-room.tsx) |
| Initializing Protocol | inline in [game-room.tsx](file:///d:/Dev/hobby/me/code-red/components/room/game-room.tsx) |
| Uptime                | [uptime-phase.tsx](file:///d:/Dev/hobby/me/code-red/components/room/uptime-phase/uptime-phase.tsx) |
| Security Clearance Hearing | [hang-vote-phase.tsx](file:///d:/Dev/hobby/me/code-red/components/room/hearing-phase/hang-vote-phase.tsx) |
| Security Clearance Result  | [hang-vote-result-phase.tsx](file:///d:/Dev/hobby/me/code-red/components/room/hearing-phase/hang-vote-result-phase.tsx) |
| Downtime (Good Side)  | [downtime-phase.tsx](file:///d:/Dev/hobby/me/code-red/components/room/downtime-phase/downtime-phase.tsx) |
| Downtime (Bad Side)   | [kill-vote-phase.tsx](file:///d:/Dev/hobby/me/code-red/components/room/kill-vote-phase/kill-vote-phase.tsx) / [downtime-bad-phase.tsx](file:///d:/Dev/hobby/me/code-red/components/room/downtime-phase/downtime-bad-phase.tsx) |
| Incident Report       | [incident-report-phase.tsx](file:///d:/Dev/hobby/me/code-red/components/room/incident-report/incident-report-phase.tsx) |
| End Screen            | [end-screen-phase.tsx](file:///d:/Dev/hobby/me/code-red/components/room/end-screen/end-screen-phase.tsx) |
