const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const itemRoutes = require("./routes/itemRoutes");
const userRoutes = require("./routes/userRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const adminRoutes = require("./routes/adminRoutes");
const currencyRoutes = require("./routes/currencyRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// Larger body limit than the default 100kb: item photos are sent as a data-URI
// (base64) in the JSON body. The frontend shrinks them first, so 2mb gives
// ample margin without leaving the door wide open.
app.use(bodyParser.json({ limit: "2mb" }));
app.use(express.json({ limit: "2mb" })); // so req.body works with JSON
app.use(express.urlencoded({ extended: true, limit: "2mb" })); // for form-data
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
app.use("/items", itemRoutes);
app.use("/users", userRoutes);
app.use("/campaigns", campaignRoutes);
app.use("/admin", adminRoutes);
app.use("/currencies", currencyRoutes);
app.use("/notifications", notificationRoutes);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
