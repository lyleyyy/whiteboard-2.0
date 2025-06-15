# 🧠 Whiteboard 2.0

A real-time collaborative whiteboard application built with a modern full-stack monorepo architecture mainly using **Turborepo**, **Vite**, **Express**, and **Socket.IO**. Supports live drawing, room-based collaboration, and persistent data with Supabase.

---

## 📦 Tech Stack

- **Monorepo Tool**: Turborepo + Yarn Workspaces
- **Frontend**: React, Vite, Tailwind CSS, Konva, TypeScript, Socket.IO
- **Backend**: Node.js, Express, TypeScript, Socket.IO
- **Deployment**:
  - Client: Vercel or S3 (not deployed yet)
  - Server: AWS Elastic Beanstalk

---

## 📁 Project Structure

```bash
whiteboard-2.0/
├── apps/
│   ├── client/           # Frontend application (Vite + React)
│   └── server/           # Backend application (Express + Socket.IO)
├── scripts/
│   └── prepare-eb-deploy.sh # Helper script for AWS EB deployment
├── turbo.json            # Turborepo config
├── package.json          # Yarn workspaces
└── yarn.lock
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd apps/client
yarn

cd apps/server
yarn
```

### 2. Run Development Apps

Frontend:

```bash
cd apps/client
yarn dev
```

Backend:

```bash
cd apps/server
yarn dev
```

Or from the project root (where `package.json` and `turbo.json` are):

```bash
yarn dev
```

---

## 🛠 Deploying to Elastic Beanstalk

### 1. Set Up Environment Variables

Set them in Elastic Beanstalk (recommended), or create a `.env.production` file in `/apps/server`.

Example:

```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-anon-key
```

### 2. Build & Package Server

```bash
./scripts/prepare-eb-deploy.sh
```

This will:

- Install dependencies
- Build the server
- Zip everything into `whiteboard-server-deploy.zip`

### 3. Upload to EB Console

Upload `whiteboard-server-deploy.zip` to your Elastic Beanstalk application environment.

---

## ✅ Features

- ✅ Real-time drawing with Socket.IO
- ✅ Room-based collaborative sessions
- ✅ WebSocket + RESTful API support
- ✅ Supabase integration for persistent storage
- ✅ AWS Elastic Beanstalk deployment script
- ✅ Modular monorepo architecture

---

## 🧪 In Progress / TODO

- [ ] Authentication and access control
- [ ] Frontend deployment to Vercel or S3
- [ ] Unit / integration tests
- [ ] More advanced drawing logic (e.g. shape tools, text input, selection...)
- [ ] Further system performance optimization (e.g. debouncing, batching, scaling for more concurrent users...)

---

## 👨‍💻 Author

**Lyle Yang**
Full Stack Engineer based in Barcelona
[LinkedIn](https://www.linkedin.com/in/lyle-yang-b694211b7/)
