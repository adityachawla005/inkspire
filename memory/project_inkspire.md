---
name: project-inkspire
description: Inkspire is a local WebGPU animation studio; real-time collab via Socket.io was implemented in June 2026
metadata:
  type: project
---

Inkspire is a client-side WebGPU animation studio (TypeScript + Webpack). Real-time collaboration was built on top of it in June 2026.

**Why:** Resume claimed Socket.io collab, delta-sync, and multi-user support — none of which existed. User asked to implement and run it.

**What was built:**
- `server/server.js` — Express + Socket.io server serving static files + handling rooms
- `src/core/collabManager.ts` — client-side collab: join-room, stroke-start/delta/commit events, latency ping
- `src/graphics/strokeManager.ts` — collab hooks woven into `update()`, remote stroke buffer for rendering peers' in-progress strokes
- `src/control/app.ts` — CollabManager wired up, splash "Collaborate" button, collab badge in toolbar
- Delta-sync: only new `[x,y]+radius` points are broadcast per 50ms interval; commits send the full finalized stroke

**How to run:** `npm start` (builds then starts Node server at port 3000). `npm run dev` for webpack watch + server.

**How to apply:** When working on collab features, the server state lives in `server/server.js` `rooms` Map and is authoritative. Full-state syncs happen on undo/redo/frame-ops.
