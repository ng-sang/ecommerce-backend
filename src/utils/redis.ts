import { createClient } from "redis";

// Mặc định Redis sẽ chạy ở: redis://localhost:6379
const redisClient = createClient();

redisClient.on("error", (err) => console.log("❌ Lỗi kết nối Redis:", err));
redisClient.on("connect", () =>
  console.log("🟢 Bộ nhớ đệm Redis đã sẵn sàng!"),
);

export const connectRedis = async () => {
  await redisClient.connect();
};

export default redisClient;
