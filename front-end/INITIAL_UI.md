# Initial UI Design Reference

This document captures the initial UI mockup for each module in the Eventure front-end. The original prototype was built as a single self-contained file (`initailUI.tsx`) using mock data to demonstrate the intended look and feel before live API integration.

---

## Table of Contents

1. [Sidebar & Navigation](#1-sidebar--navigation)
2. [Dashboard](#2-dashboard)
3. [My Tasks](#3-my-tasks)
4. [Notifications](#4-notifications)
5. [Clubs (Club Management)](#5-clubs-club-management)
6. [Club Details](#6-club-details)
7. [Event Task Board](#7-event-task-board)
8. [Events](#8-events)
9. [Modals](#9-modals)

---

## 1. Sidebar & Navigation

**Purpose:** Persistent left-hand navigation present on every page.

**Layout:**
- Fixed dark-teal sidebar (`bg-[#0a3d3d]`), 260 px wide, full viewport height.
- **Brand logo** — teal "E" icon + "Eventure" wordmark at the top.
- **Nav items** (in order): Dashboard, Clubs, Events, Tasks — each with a matching Lucide icon.
  - Active item highlighted with a darker background (`bg-[#155758]`) and a teal icon.
  - Inactive items use muted teal text with a hover highlight.
- **User footer** — avatar, display name, and a logout icon pinned to the bottom.

---

## 2. Dashboard

**Purpose:** Landing page giving the user an at-a-glance overview of their activity.

**Sections:**

### Header
- Personalised greeting: *"Welcome back, {name}!"* with a subtitle.
- **New Event** button (teal, top-right).

### Stats Row (3 cards)
| Card | Value | Sub-text |
|---|---|---|
| Active Events | 4 | +2 this month |
| Pending Tasks | 12 | 3 due today |
| Club Memberships | 3 | Admin in 2 clubs |

Each card shows a coloured circular icon, a large numeric value, and a trending indicator.

### Upcoming Events (left 2/3)
- Horizontal list of event cards (max 3 shown).
- Each card: coloured date badge (month + day), event title, club name, location, attendee count, and a status pill.
- Clicking a card navigates to the event detail.

### My Tasks sidebar (right 1/3)
- Compact task list titled *"Tasks Due Soon"* with a "4 Pending" counter.
- Each task row: left colour border by priority, task title, associated event name, due date, and assignee avatar.
- **"Go to Task Board"** link at the bottom.

---

## 3. My Tasks

**Purpose:** Personal task management page showing all tasks assigned to the user across all clubs and events.

**Layout:**
- Page header with title and **Filter / Sort** buttons.
- **Tab bar:** To Do · Completed · All — each tab shows a count badge.
- Task list (cards):
  - Circle checkbox (toggles completion).
  - Task title (strikethrough + dimmed when complete).
  - Event name + club name as metadata.
  - Priority badge: High (red) · Medium (yellow) · Low (green).
  - Due date with a clock icon (orange for today/tomorrow).
  - Three-dot overflow menu (visible on hover).
- Empty state: centred icon + *"You're all caught up for now!"* message.

---

## 4. Notifications

**Purpose:** Centralised inbox for club invitations, task assignments, and event reminders.

**Layout:**
- Page header with title, subtitle, and a **"Mark all as read"** action.
- **Filter buttons:** Alls · Invites · Tasks · Reminders.
- Notification cards:
  - Unread cards have a teal border and a small teal dot indicator.
  - Icon varies by type:
    - **Invite** → blue `UserPlus` icon.
    - **Task** → orange `CheckSquare` icon.
    - **Reminder** → grey `Calendar` icon.
  - Content: bold type label, timestamp (top-right), and a descriptive sentence.
  - Invite notifications include **Accept / Decline** action buttons (shown while unread).
- Clicking a card marks it as read.
- Empty state: large bell icon + contextual message.

---

## 5. Clubs (Club Management)

**Purpose:** Grid view of all clubs the user belongs to, with discovery and creation options.

**Layout:**
- Page heading: *"Club Management"*.
- **Toolbar:**
  - Search box (left).
  - Action buttons (right): Filter · Sort by · Join Club · Create Club.
- **Club grid** (responsive: 1 → 2 → 3 → 4 columns):
  - Each card is 180 px tall with an 80 px colour banner at the top.
  - Below the banner: club name, category badge (colour-coded by type), upcoming event name, and member count.
  - Hovering lifts the card with a shadow; clicking navigates to Club Details.

**Club categories and badge colours:**
| Type | Badge colour |
|---|---|
| Technology | Blue |
| Academic | Indigo |
| Hobby | Orange |
| Social | Orange/Emerald |
| Cultural | Red |

---

## 6. Club Details

**Purpose:** Full details page for a single club with tabbed sub-sections.

**Header / Banner:**
- Full-width colour banner (same colour as the club card).
- *"← Back to Clubs"* button overlaid on the banner.

**Club info card** (floats below the banner, `-mt-12`):
- Club name + category badge.
- One-line description paragraph.
- Member count + **Leave Club** button (red).

**Tab bar:** Overview · Events · Members · Settings

### Overview Tab
- **About the Club** card (left 2/3): descriptive paragraphs about the club's mission and community.
- **External Links** card (right 1/3): Discord, Instagram, and website links with matching icons. Shows a dashed placeholder if none are set.

### Events Tab
- Grid of event cards (same card design as the Events page).
- **New Event** button (top-right).
- Each card navigates to the Event Task Board.

### Members Tab
- Table/list of current members with:
  - Avatar, full name, email, role badge (Admin / Event Manager / Member), and join date.
  - Three-dot action menu per row (edit role, remove).
- **Invite Members** button at the top.

### Settings Tab
- Club profile edit form: name, category, description, social links.
- Danger zone: **Delete Club** button.

---

## 7. Event Task Board

**Purpose:** Kanban-style task management board for a specific event, with a list-view alternative.

**Header bar** (dark teal `bg-[#174646]`):
- *"← Back"* breadcrumb.
- Event title + *"Task Board • {Club Name}"* badge.
- Event metadata: date, member count, total task count.
- **Filter by tag** dropdown + **Add task** button.

**Tab bar:** Board · List · Budget · Files

### Board Tab (Kanban)
Four columns: **Backlog** · **In Progress** · **Review** · **Done**

Each column shows:
- Column header with task count badge.
- Scrollable task cards:
  - Tag badge (Design / Finance / Logistics / Marketing / Operations / Tech) with colour coding.
  - Task title and description (2-line truncated).
  - Colour dot (priority indicator), due date or sub-task progress.
  - Assignee avatars (stacked).
  - Done cards are greyed/strikethrough with a green *"Done"* checkmark.

### List Tab
- Flat table with columns: Tag · Title · Due Date · Assignees · Status.
- Filterable by tag.

### Budget Tab
- Summary cards: Total Budget · Spent · Remaining.
- Line-item table: Item · Category · Amount · Status (Paid / Pending) · Date.

### Files Tab
- File attachment list (name, type icon, size, upload date).
- **Upload** button.

---

## 8. Events

**Purpose:** Browse and manage all events across all the user's clubs.

**Layout:**
- Page heading + subtitle.
- **Toolbar:** search input, filter icon button, **Create Event** button.
- **Tab bar:** All Events · Upcoming · Drafts · Past.
- **Event card grid** (1 → 2 → 3 columns):
  - Colour banner with club name badge and a three-dot menu.
  - Event title (teal on hover), date, location.
  - Footer row: status pill (colour-coded) + attendee count.
- Clicking a card opens the event's task board.

---

## 9. Modals

### Create Club
- Fields: Club Name, Club Type (dropdown), Description (textarea).
- Primary action: **Create Club**.

### Join Club
- Search field to find a club by name or code.
- Results list with a **Join** button per result.

### Invite Members
- Search field to find platform users by name or email.
- Selected users shown as chips.
- Role assignment dropdown (Event Manager / Member).
- **Send Invites** button.

### Create Event
- Fields: Event Name, Club (dropdown), Date, Location, Description, Banner colour picker.
- Multi-step or single-page form.
- Primary action: **Create Event**.

### Create Task
- Fields: Title, Description, Tag (category), Column (Backlog / In Progress / Review / Done), Due Date, Assignees.
- Primary action: **Add Task**.

### Leave Club
- Confirmation dialog: *"Are you sure you want to leave {Club Name}?"*
- **Leave** (red destructive) and **Cancel** buttons.
