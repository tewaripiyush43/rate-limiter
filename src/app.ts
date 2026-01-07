import rateLimiter from "#middlewares/rateLimit.js";
import express from "express";

const app = express();
app.use(express.json());

app.use(rateLimiter);

app.get("/health", (req, res) => {
  res.send({ status: "ok" })
})

export default app;