import express from "express";

const app = express();
app.use(express.json());

app.get("/health", (req, res)=>{
  res.send({status: "ok"})
})

export default app;