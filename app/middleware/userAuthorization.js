const jwt = require("jsonwebtoken");

const authenticateUser = async (req, res, next) => {
  const tokenData = req.headers["authorization"];
  try {
    if (tokenData) {
      console.log(tokenData)
      const token = tokenData.split(" ")[1];
      const result = jwt.verify(token, process.env.SECRET_KEY);
      req.user = result;
      next();
    } else {
      return res.status(401).json({ error: "authorization failed" });
    }
  } catch (e) {
    res.status(400).json(e);
  }
};

const authorizeUser = (roles) => {
  return function (req, res, next) {
    console.log(req.user,roles)
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res
        .status(403)
        .json({ error: "you are not permitted to access this route" });
    }
  };
};

module.exports = { authenticateUser, authorizeUser };
