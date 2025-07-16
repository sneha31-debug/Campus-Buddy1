
# 🎓 Campus Buddy

A centralized platform for **students and clubs at NST** to discover, manage, and track campus events — helping the campus stay connected and engaged.

---

## 📌 Problem

Students often **miss out on campus events** — workshops, fests, hackathons — due to **scattered communication** across Slack, WhatsApp, or word of mouth.

---

## 🚀 Solution

**Campus Buddy** brings everything under one roof with a **student-first, modern web app** that:

* Helps **students explore, RSVP**, and track events
* Allows **clubs to create/manage events**
* Provides personalized **dashboards and profiles**
* Lets students quickly **add events to their calendar** with one click
* Will soon support features like **volunteering, gamification, and email reminders**

---

## 🔥 Key Features

### 👨‍🎓 Students

* ✅ Login via Google Sign-in
* 📅 Browse upcoming & past events
* 🏷️ Filter by club, category, department
* 📩 RSVP with "Going", "Not Going", "Maybe"
* 📂 View your RSVP’d events in **My Events**
* 🪪 **Student Mini Profile Card** showing:

  * Name, Course, Year, etc.
* 🗓️ **Add to Calendar** option for each event

---

### 🏛️ Clubs

* ✅ Login via Google (verified club ID)
* ➕ Create, edit, and delete events
* 📊 Track RSVP stats (Going, Not Going, Maybe)
* 🗂️ **Club Mini Profile Card** showing:

  * Club Name, Department, Bio, etc.
  * Total Events Created
* 📋 **Club Dashboard** for quick access to:

  * List of Events
  * Event stats
  * Create New Event
  * Edit & Delete Events

---

### 💡 Future Additions

* 🔔 Email reminders
* 🏆 Gamification (points, badges, streaks)

---

## 💻 Tech Stack

| Layer        | Technology                                                   |
| ------------ | ------------------------------------------------------------ |
| Frontend     | React (Vite), **External CSS**                               |
| Auth & DB    | Supabase (PostgreSQL + Auth)                                 |
| UI Libraries | Selectively using components from Aceternity UI / React Bits |
| Hosting      | Vercel                                                       |


---


## 🤝 Getting Started as a Contributor

> Want to contribute? Start here 👇

1. **Fork** this repo
2. Clone your fork

   ```bash
   git clone https://github.com/your-username/campusbuddy.git
   ```
3. Navigate to the frontend folder

   ```bash
   cd campusbuddy/frontend
   ```
4. Install dependencies

   ```bash
   npm install
   ```
5. Start the dev server

   ```bash
   npm run dev
   ```
6. Create a new branch

   ```bash
   git checkout -b feature/your-feature-name
   ```
7. Make your changes and push

   ```bash
   git push origin feature/your-feature-name
   ```
8. Create a **Pull Request** and link to the corresponding issue (if any)

📌 **Note:** All `.env.local` files are ignored — never push secret keys or tokens.
> 🔐 Don't forget to configure `.env.local` (and keep it out of version control).


---


## 🛠️ Project Objectives

* Centralize event discovery and management
* Personalize experience through role-based dashboards
* Simplify event creation for clubs
* Help students stay informed and organized through RSVP and calendar support

---

## 💬 Let’s Build It Together

Campus Buddy is built by students, for students. Whether you're a coder, designer, or organizer — your contribution matters!

> Let’s build something that brings campus life together. 🚀

---
