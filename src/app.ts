import rateLimitMiddleware from "#middlewares/rateLimitMiddleware.js";
import express from "express";

const app = express();
app.use(express.json());

app.use(
  rateLimitMiddleware({
    limit: 500,
    windowInSeconds: 60,
    strategy: "fixed",
    identifier: () => "GLOBAL"
  })
);

app.get(
  "/health",
  rateLimitMiddleware({
    limit: 25,
    windowInSeconds: 60,
    strategy: "sliding"
  }),
  (_req, res) => {
    res.json({ status: "ok" });
  }
);

export default app;