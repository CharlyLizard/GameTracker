const User = require('../models/Usuario');

async function generateUniqueTag(nickname) {
  let tag;
  let exists = true;
  while (exists) {
    tag = String(Math.floor(1000 + Math.random() * 9000)); // 4 dígitos
    exists = await User.findOne({ nickname, tag });
  }
  return tag;
}

module.exports = { generateUniqueTag };