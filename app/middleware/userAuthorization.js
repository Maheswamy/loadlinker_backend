const jwt = require("jsonwebtoken");

const userAuthorization = async (req, res, next) => {
  const tokenData = req.headers["authorization"];
  try {
    if (tokenData) {
      const token = tokenData.split(" ")[1];
      const result = jwt.verify(token, process.env.SECRET_KEY);
      req.user=result
      next();
    } else {
      return res.status(401).json({ error: "authorization failed" });
    }
  } catch (e) {
    res.status(400).json(e);
  }
};

module.exports = { userAuthorization };
