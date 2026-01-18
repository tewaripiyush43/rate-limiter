import rateLimitMiddleware from "#middlewares/rateLimitMiddleware.js";
import express from "express";

const app = express();
app.use(express.json());

app.use(rateLimitMiddleware);

app.get("/health", (req, res) => {
  res.send({ status: "ok" })
})

export default app;