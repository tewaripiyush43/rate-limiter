import { createClient } from "redis";

const client = await createClient();
client.on("error", () => { console.log("Error while connecting to redis"); process.exit(1) });

export default client;