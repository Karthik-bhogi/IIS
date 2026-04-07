### Internship Intelligence System (IIS) — Detailed Product Specification

#### 1. Product Vision
A mobile-first web application that acts as a personal knowledge system for internship performance, capturing not just activities but impact, decisions, and growth. 
**Core idea:** Convert daily work into structured, retrievable, review-ready intelligence with guaranteed data privacy for multi-user environments.

#### 2. Problem Statement
Interns face key problems:
* **Memory loss:** Cannot recall what they did over weeks.
* **Lack of structure:** Notes are scattered (Notion, WhatsApp, docs).
* **Weak review articulation:** Cannot translate work into impact stories.
* **Result:** Poor mid/final reviews and weak interview answers.

#### 3. Product Goals
**Functional Goals**
* Capture daily work in a structured format with interactive Card UIs.
* Track stakeholders and meetings through dedicated databases.
* Store supporting artifacts seamlessly securely in the Cloud.
* Enable persistent, context-aware routing through a global Sidebar layout.
* **Ensure strict data isolation** via Postgres Row Level Security (RLS).

**Outcome Goals**
* Generate review-ready summaries.
* Surface high-impact contributions dynamically via Timeline feeds.
* Help users articulate STAR stories.

#### 4. User Journey
**Daily Flow (Primary Loop)**
1. Open app (mobile-responsive React dashboard).
2. **Authenticate securely** via Email/Password (Supabase Auth).
3. Log daily activities using native Voice Dictation (Web Speech API).
4. Attach relevant files directly (Supabase Storage).
5. Save records into isolated database rows continuously syncing across devices.
*Time: 3–7 minutes*

**Weekly & Review Flows**
* Review chronological feeds on the Unified Timeline.
* Jump into detailed views of precise Entries, Meetings, or Stakeholders.
* Modify, edit, or delete existing records rapidly via inline actions on Card views.

#### 5. Feature Specifications (What's Built)
**5.1 Authentication & Security**
* Fully functioning Sign-Up and Login flow.
* Server-side route middleware protection.
* Row Level Security (RLS) enabled on all tables strictly isolating rows by `user_id = auth.uid()`.

**5.2 Global UI / UX Architecture**
* **Persistent Navigation:** A global left-hand `Navbar` sidebar exists universally across the entire authenticated application (Dashboard, List Views, Detail Views, New Forms, and Edit Forms).
* **Card-Based UI:** All list interfaces utilize interactive card layouts equipped with immediate inline actions (Edit, Delete, Download Attachments).

**5.3 Work Entries (`/entries`)**
* **Data Points:** `date`, `work_logs` (JSON array), `impact`, `challenges`, `learnings`, and `documents` (Storage URLs).
* **Functionality:** Voice dictation, Multi-file uploads resolving to Supabase Storage, Full CRUD lifecycle.

**5.4 Meetings (`/meetings`)**
* **Data Points:** `datetime`, `title`, `notes`, `transcript`, `contribution`, `decisions`, `action_items`, `documents`.
* **Functionality:** Voice dictation for transcripts/notes, specific Card mapping for "Summary" and "Action Items", Full CRUD.

**5.5 People / Stakeholders (`/people`)**
* **Data Points:** `name`, `role`, `organization`, `notes`, `documents`.
* **Functionality:** Networking tracker with Full CRUD lifecycle mirroring the UI behavior of Entries and Meetings.

**5.6 Unified Timeline (`/timeline`)**
* A macro-level dashboard feed aggregating both Work Entries and Meetings.
* Automatically sorts everything into a single reverse-chronological view.

#### 6. Data Model (Detailed & Multi-Tenant)
Every primary Postgres table utilizes `uuid` Primary Keys and enforces a foreign key constraint to `user_id` (`auth.users`).

* **Entry:** `{ id, user_id (FK), date, workLogs: [{ text }], files: [fileUrl], impact, challenges, learnings }`
* **Person:** `{ id, user_id (FK), name, role, organization, notes, documents: [fileUrl] }`
* **Meeting:** `{ id, user_id (FK), title, datetime, notes, transcript, decisions, actionItems, contribution, documents: [fileUrl] }`

#### 7. Tech Architecture
* **Frontend:** Next.js 15 (App Router, Server Actions), Tailwind CSS, Lucide React (Icons).
* **Backend:** Supabase, PostgreSQL DB, Supabase Storage for files.
* **Security:** **Mandatory Authentication** via Supabase Auth + **Row Level Security (RLS)** strictly isolating `user_id` data.
* **Integrations:** Native Browser Web Speech API for voice-to-text inputs.

#### 8. Future Roadmap / Fast-Follow Features
* **AI Summaries / RAG:** Implementing LLM queries over the stored Entries and Meeting Transcripts to automatically build end-of-internship reports.
* **Dashboard Visualizations:** Activating the tracking charts to dynamically count logged contributions and interactions.
* **Multi-Player Accountability:** Blinded activity streaks ("Friend Group" tracking) with strictly hidden payloads.
* **Advanced Search Filters:** Keyword indexing across the Unified Timeline.

#### 9. Product Philosophy & Positioning
* Capture less noise, more signal. Prioritize impact over activity. Build for recall, not storage.
* **This is not just a tracker.** **This is a personal performance intelligence system for high-stakes career moments.**