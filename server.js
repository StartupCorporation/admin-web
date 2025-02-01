import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { authMiddleware } from "./auth-middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: `./.env` });

const NODE_ENV = process.env.NODE_ENV || "development";

const app = express();

app.use(authMiddleware);

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/admin", "index.html"));
});

const PORT = process.env.VITE_PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `Server is running on port  http://localhost:${PORT} in ${NODE_ENV} mode.`,
  );
});
