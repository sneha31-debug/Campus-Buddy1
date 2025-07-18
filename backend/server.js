import jsonServer from "json-server";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults({
  static: "./dist", // Vite builds to 'dist' folder
});

// Enable CORS
server.use(cors());

// Use default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Use the router for API routes
server.use("/api", router);

// Serve React app for all other routes (SPA support)
server.get("*", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});
