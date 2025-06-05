const MensajeBuzon = require('../models/MensajeBuzon');

exports.getInboxMessages = async (req, res) => {
  const userId = req.user.id;
  const mensajes = await MensajeBuzon.find({ userId }).sort({ date: -1 });
  res.json({ mensajes });
};

exports.createInboxMessage = async (req, res) => {
  const userId = req.user.id;
  const { subject, sender, body } = req.body;
  const mensaje = await MensajeBuzon.create({ userId, subject, sender, body });
  res.status(201).json({ mensaje });
};

exports.markMessageRead = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  await MensajeBuzon.updateOne({ _id: id, userId }, { $set: { read: true } });
  res.json({ ok: true });
};

exports.deleteInboxMessage = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  await MensajeBuzon.deleteOne({ _id: id, userId });
  res.json({ ok: true });
};