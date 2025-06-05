const MensajeBuzon = require('../models/MensajeBuzon');

async function enviarMensajeBuzon({ userId, subject, sender, body }) {
  return MensajeBuzon.create({
    userId,
    subject,
    sender,
    body,
    date: new Date(),
    read: false
  });
}

module.exports = { enviarMensajeBuzon };