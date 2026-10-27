require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;

if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection failed; API will continue without persistence:", err.message));
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API Monitoring backend listening on port ${PORT}`);
});
