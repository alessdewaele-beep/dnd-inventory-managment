const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Geen token meegegeven" });
  }

  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Ongeldige of verlopen token" });
  }
}


function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Niet geauthenticeerd" });
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Onvoldoende rechten" });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
