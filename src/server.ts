import "dotenv/config";
import app from "#app.js";
import client from "#config/redis.js";

const PORT = process.env.PORT || 9001;

await client.connect().then(() => { console.log("Redis server is connected") });

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})
