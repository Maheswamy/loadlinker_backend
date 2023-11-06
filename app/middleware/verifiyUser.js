const User = require("../models/user-model");

const verifyUser = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (user.isVerified) {
      next();
    } else {
      return res.status(403).json({ error: "please verify account before using" });
    }
  } catch (e) {
    res.status(500).json(e.message);
  }
};

module.exports = { verifyUser };
