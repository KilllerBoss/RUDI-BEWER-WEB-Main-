import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "cms-data.json");

async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function writeData(data: any) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.get("/api/cms", async (req, res) => {
    const data = await readData();
    res.json(data);
  });

  app.post("/api/cms", async (req, res) => {
    const { id, content, type } = req.body;
    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    const data = await readData();
    data[id] = { content, type };
    await writeData(data);

    res.json({ success: true });
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
