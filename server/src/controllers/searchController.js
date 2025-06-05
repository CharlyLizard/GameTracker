const User = require("../models/Usuario");

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

exports.searchUsers = async (req, res) => {
  const { query } = req.query;
  if (!query || query.length < 3) {
    return res.status(400).json({ error: "Debes escribir al menos 3 caracteres." });
  }

  let nickname = query;
  let tag = null;

  // Si el usuario busca con #tag
  if (query.includes("#")) {
    [nickname, tag] = query.split("#");
    tag = tag?.trim();
  }

  let users;
  if (tag) {
    users = await User.find({ nickname, tag }).select("nickname tag nombre profileImageUrl");
  } else {
    users = await User.find({ nickname: new RegExp("^" + nickname, "i") }).select("nickname tag nombre profileImageUrl");
  }

  // Asegura que la URL sea absoluta si es una ruta relativa
  users = users.map(u => ({
    ...u.toObject(),
    profileImageUrl: u.profileImageUrl
      ? (u.profileImageUrl.startsWith("/")
          ? `${SERVER_URL}${u.profileImageUrl}`
          : u.profileImageUrl)
      : ""
  }));

  res.json({ users });
};