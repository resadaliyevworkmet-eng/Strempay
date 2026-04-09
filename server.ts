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
  const uploadsDir = path.join(process.cwd(), "uploads");
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
  console.log("Multer initialized successfully");

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

  app.post("/api/donations", async (req, res) => {
    const data = readData();
    const donation = {
      ...req.body,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now()
    };
    data.donations.push(donation);
    writeData(data);

    // Notify overlay of new donation via SSE (legacy)
    sendToClients({ type: "new-donation", username: donation.receiver, donation });

    // Write to Firestore via Admin SDK (reliable)
    try {
      if (fsDb) {
        await fsDb.collection('alerts').add({
          type: 'donation',
          receiver: donation.receiver,
          sender: donation.sender,
          amount: donation.amount,
          message: donation.message,
          timestamp: donation.timestamp
        });
        
        // Also update profile balance in Firestore
        const profileRef = fsDb.collection('profiles').doc(donation.receiver);
        const profileDoc = await profileRef.get();
        
        // Fetch platform settings for fee
        const settingsDoc = await fsDb.collection('platform_settings').doc('global').get();
        const feePercentage = settingsDoc.exists ? settingsDoc.data().feePercentage : 10;
        const platformFee = donation.amount * (feePercentage / 100);
        const netAmount = donation.amount - platformFee;

        if (profileDoc.exists) {
          const profileData = profileDoc.data();
          await profileRef.update({
            balance: (profileData?.balance || 0) + netAmount,
            totalEarnings: (profileData?.totalEarnings || 0) + netAmount,
            'goal.currentAmount': (profileData?.goal?.currentAmount || 0) + donation.amount
          });
        }

        // Log to all_donations
        await fsDb.collection('all_donations').add({
          ...donation,
          platformFee,
          netAmount,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    } catch (err) {
      console.error("Error writing donation to Firestore:", err);
    }

    res.json(donation);
  });

  app.post("/api/subscriptions", async (req, res) => {
    const { username, subscription } = req.body;
    // Notify overlay of new subscription via SSE (legacy)
    sendToClients({ type: "new-subscription", username, subscription });

    // Write to Firestore via Admin SDK (reliable)
    try {
      if (fsDb) {
        // Fetch platform settings for fee
        const settingsDoc = await fsDb.collection('platform_settings').doc('global').get();
        const feePercentage = settingsDoc.exists ? settingsDoc.data().feePercentage : 10;
        const price = subscription.price || 0;
        const platformFee = price * (feePercentage / 100);
        const netAmount = price - platformFee;

        await fsDb.collection('alerts').add({
          type: 'subscription',
          receiver: username,
          subscriberName: subscription.subscriberName,
          tierName: subscription.tierName,
          timestamp: subscription.startDate || Date.now()
        });

        // Update profile balance
        const profileRef = fsDb.collection('profiles').doc(username);
        const profileDoc = await profileRef.get();
        if (profileDoc.exists) {
          const profileData = profileDoc.data();
          await profileRef.update({
            balance: (profileData?.balance || 0) + netAmount,
            totalEarnings: (profileData?.totalEarnings || 0) + netAmount
          });
        }

        // Log to all_donations (as a general transaction log)
        await fsDb.collection('all_donations').add({
          type: 'subscription',
          sender: subscription.subscriberName,
          receiver: username,
          amount: price,
          platformFee,
          netAmount,
          tierName: subscription.tierName,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    } catch (err) {
      console.error("Error writing subscription alert to Firestore:", err);
    }

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
  app.post("/api/upload", (req, res) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        return res.status(400).json({ error: `Multer error: ${err.message}` });
      } else if (err) {
        console.error("Unknown upload error:", err);
        return res.status(500).json({ error: `Upload error: ${err.message}` });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      console.log(`File uploaded successfully: ${fileUrl}`);
      res.json({ url: fileUrl });
    });
  });

  // Get top streamers
  app.get("/api/top-streamers", async (req, res) => {
    try {
      if (fsDb) {
        const snapshot = await fsDb.collection('profiles')
          .orderBy('totalEarnings', 'desc')
          .limit(5)
          .get();
        
        const streamers = snapshot.docs.map(doc => ({
          username: doc.id,
          ...doc.data()
        }));
        return res.json(streamers);
      }
      
      // Fallback to local data
      const data = readData();
      const streamers = Object.values(data.profiles)
        .sort((a: any, b: any) => (b.totalEarnings || 0) - (a.totalEarnings || 0))
        .slice(0, 5);
      res.json(streamers);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch top streamers" });
    }
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
