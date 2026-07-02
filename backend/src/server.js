const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const itemRoutes = require("./routes/itemRoutes");
const userRoutes = require("./routes/userRoutes");
const campaignRoutes = require("./routes/campaignRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); // zodat req.body werkt met JSON
app.use(express.urlencoded({ extended: true })); // voor form-data
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
app.use("/items", itemRoutes);
app.use("/users", userRoutes);
app.use("/campaigns", campaignRoutes);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
