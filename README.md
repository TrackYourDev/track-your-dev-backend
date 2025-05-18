# 🚀 PushSage

**PushSage** is a GitHub-integrated productivity dashboard that helps organizations track developer activity based on real Git `push` events — no device tracking required.

---

## 🔧 What It Does

PushSage allows you to:
- Track commits pushed to your GitHub repositories
- View developer activity over time
- Monitor repository-level changes
- Provide a manager-friendly dashboard with commit insights
- Use MongoDB for scalable, flexible data storage

---

## 🌐 Tech Stack

| Layer       | Tech                   |
|------------|------------------------|
| Backend     | Node.js + Express      |
| Database    | MongoDB + Mongoose     |
| GitHub Integration | GitHub App + Webhooks |
| Auth (Planned) | Supabase Auth or GitHub OAuth |
| Frontend (Planned) | Next.js + TailwindCSS |
| Deployment  | Vercel / Railway / Render |

---

## 🧩 Features

- 🔗 GitHub App integration (via Webhooks)
- 🧠 Stores commit data including user info, repo, timestamps, and files changed
- 📊 Query-ready MongoDB schema
- ⚙️ Fully modular backend (models, services, routes)

---

## 📁 Project Structure

```

pushsage-backend/
├── src/
│   ├── config/           # DB config and secrets
│   ├── models/           # Mongoose schemas (commit, user, repository)
│   ├── controllers/      # Route handlers
│   ├── routes/           # Express route definitions
│   ├── services/         # Business logic and GitHub utilities
│   ├── middlewares/      # Webhook signature verification, etc.
│   ├── utils/            # Helper functions
│   ├── app.ts            # Express app setup
│   └── server.ts         # Entry point

````

---

## 🛠️ How to Run Locally

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/pushsage.git
   cd pushsage
````

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env` file**

   ```
   PORT=3000
   MONGODB_URI=mongodb+srv://your_uri
   MONGODB_DBNAME=pushsage
   GITHUB_APP_WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Start the dev server**

   ```bash
   npm run dev
   ```

---

## 📦 API Endpoints

### `POST /webhook`

* Receives GitHub push events
* Verifies signature
* Stores commit data in MongoDB

---

## ✅ To Do / Roadmap

* [x] Webhook handling
* [x] MongoDB models and storage
* [ ] Developer dashboard UI
* [ ] Auth integration
* [ ] AI commit summary generation (coming soon)

---

## 🤝 Contributing

PRs and ideas are welcome! If you want to contribute, feel free to open an issue or submit a pull request.

---

## 📄 License

MIT © 2025 Ashim

```

---

Would you like me to:
- Generate a badge set (build, license, etc.)?
- Help write GitHub issue templates or contribution guides?
- Add install/launch instructions for Vercel or Railway?

Let me know and I’ll enhance it!
```
