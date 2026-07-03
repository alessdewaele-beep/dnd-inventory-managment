const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const itemRoutes = require("./routes/itemRoutes");
const userRoutes = require("./routes/userRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const adminRoutes = require("./routes/adminRoutes");
const currencyRoutes = require("./routes/currencyRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// Ruimere body-limiet dan de default 100kb: item-foto's worden als data-URI
// (base64) meegestuurd in de JSON-body. De frontend verkleint ze eerst, dus
// 2mb geeft ruime marge zonder de deur wagenwijd open te zetten.
app.use(bodyParser.json({ limit: "2mb" }));
app.use(express.json({ limit: "2mb" })); // zodat req.body werkt met JSON
app.use(express.urlencoded({ extended: true, limit: "2mb" })); // voor form-data
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
app.use("/items", itemRoutes);
app.use("/users", userRoutes);
app.use("/campaigns", campaignRoutes);
app.use("/admin", adminRoutes);
app.use("/currencies", currencyRoutes);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
