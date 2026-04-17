const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const configRoutes = require("./routes/config.routes");
const setupSwagger = require("./docs/swagger");
const errorMiddleware = require("./middleware/error.middleware");
const requestLogger = require("./middleware/request-logger.middleware");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/api/health", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/config", configRoutes);
setupSwagger(app);

app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

app.use(errorMiddleware);

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
