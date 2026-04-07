import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import admin from "firebase-admin";

// Initialize Firebase Admin
let fsDb: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: firebaseConfig.projectId,
      });
    }

    fsDb = firebaseConfig.firestoreDatabaseId 
      ? admin.firestore(firebaseConfig.firestoreDatabaseId)
      : admin.firestore();
    
    console.log("Firebase Admin initialized successfully");
  } else {
    console.warn("firebase-applet-config.json not found, Firebase Admin not initialized");
  }
} catch (err) {
  console.error("Failed to initialize Firebase Admin:", err);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple file-based state management
const DATA_FILE = path.join(process.cwd(), "data.json");

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { profiles: {}, donations: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch (e) {
    return { profiles: {}, donations: [] };
  }
}

function writeData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// For real-time alerts (SSE)
let clients: any[] = [];

function sendToClients(data: any) {
  clients.forEach(client => {
    try {
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      console.error("Error sending to client", e);
    }
  });
}

// Heartbeat to keep connection alive (especially for Cloudflare)
setInterval(() => {
  clients.forEach(client => {
    try {
      client.res.write(': heartbeat\n\n');
    } catch (e) {
      // Client likely disconnected
    }
  });
}, 15000);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Multer configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  });

  const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  });

  app.use(express.json());
  app.use("/uploads", express.static(uploadsDir));

  // Real-time events (SSE)
  app.get("/api/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable buffering for Nginx/Cloudflare
    res.flushHeaders();

    const clientId = Date.now();
    const newClient = { id: clientId, res };
    clients.push(newClient);

    // Send initial comment to clear any buffers
    res.write(': ok\n\n');

    req.on("close", () => {
      clients = clients.filter(c => c.id !== clientId);
    });
  });

  // State API
  app.get("/api/state/:username", (req, res) => {
    const data = readData();
    const profile = data.profiles[req.params.username];
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json({
      profile,
      donations: data.donations.filter((d: any) => d.receiver === req.params.username)
    });
  });

  app.post("/api/state/:username", (req, res) => {
    const data = readData();
    data.profiles[req.params.username] = {
      ...data.profiles[req.params.username],
      ...req.body
    };
    writeData(data);
    
    // Notify overlay of profile update
    sendToClients({ type: "profile-update", username: req.params.username, profile: data.profiles[req.params.username] });
    
    res.json({ success: true });
  });

  app.post("/api/donations", (req, res) => {
    const data = readData();
    const donation = {
      ...req.body,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now()
    };
    data.donations.push(donation);
    writeData(data);

    // Notify overlay of new donation
    sendToClients({ type: "new-donation", username: donation.receiver, donation });

    res.json(donation);
  });

  app.post("/api/subscriptions", (req, res) => {
    const { username, subscription } = req.body;
    // Notify overlay of new subscription
    sendToClients({ type: "new-subscription", username, subscription });
    res.json({ success: true });
  });

  app.post("/api/test-alert", async (req, res) => {
    const { username } = req.body;
    const testDonation = {
      type: 'donation',
      id: "test-" + Date.now(),
      sender: "Test Dəstəkçi",
      amount: 50,
      message: "Bu bir test mesajıdır! Yayımın uğurlu keçsin!",
      timestamp: Date.now(),
      receiver: username
    };
    
    try {
      if (fsDb) {
        await fsDb.collection('alerts').add(testDonation);
      }
      sendToClients({ type: "new-donation", username, donation: testDonation });
      res.json({ success: true });
    } catch (err) {
      console.error("Error writing test alert to Firestore", err);
      res.status(500).json({ error: "Firestore write failed" });
    }
  });

  // API Routes
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Epoint Payment Routes
  app.post("/api/payment/init", async (req, res) => {
    const { amount, description, orderId } = req.body;
    
    // In a real app, you would call Epoint API here to get a payment URL
    // For now, we'll return a mock URL or instructions
    const publicKey = process.env.EPOINT_PUBLIC_KEY;
    
    if (!publicKey) {
      return res.status(500).json({ error: "Epoint configuration missing" });
    }

    // Epoint integration logic would go here
    // Example: Generate a JSON payload, base64 encode it, sign it, and send to Epoint
    
    res.json({ 
      message: "Payment initialization endpoint ready",
      orderId,
      amount,
      publicKey: publicKey.substring(0, 5) + "..."
    });
  });

  app.post("/api/payment/callback", (req, res) => {
    // This is the result_url
    console.log("Payment callback received:", req.body);
    
    // Verify signature, update database, etc.
    
    res.send("OK");
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
