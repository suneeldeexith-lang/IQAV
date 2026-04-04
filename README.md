# Course Compliance Management System

This system handles course compliance checklist verification, tracking document uploads, versions, and administrative approval mechanisms exclusively within an integrated network state.

## How to start system

**Step 1:** Install all dependencies
```bash
npm install
```

**Step 2:** Start both Backend and Frontend instances concurrently
```bash
npm run start:all
```

> [!NOTE]
> - Backend automatically maps securely onto `http://localhost:5000` executing `nodemon sever.js`.
> - Frontend mounts onto `http://localhost:5173` pointing `VITE_API_URL` to local networking.
