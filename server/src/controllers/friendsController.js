const SolicitudAmistad = require("../models/SolicitudAmistad");
const User = require("../models/Usuario");
const achievementService = require("../services/achievementService");

exports.enviarSolicitud = async (req, res) => {
  const from = req.user.id;
  const { to } = req.body;

  if (from === to) return res.status(400).json({ error: "No puedes agregarte a ti mismo." });

  // Verifica que el usuario destino exista
  const userTo = await User.findById(to);
  if (!userTo) return res.status(404).json({ error: "Usuario no encontrado." });

  // Verifica que no exista ya una solicitud pendiente o amistad
  const existe = await SolicitudAmistad.findOne({
    $or: [
      { from, to },
      { from: to, to: from }
    ],
    status: { $in: ['pendiente', 'aceptada'] }
  });
  if (existe) return res.status(400).json({ error: "Ya existe una solicitud o amistad." });

  const solicitud = await SolicitudAmistad.create({ from, to });
  res.json({ ok: true, solicitud });
};
exports.getSolicitudesPendientes = async (req, res) => {
  const userId = req.user.id;
  const solicitudes = await SolicitudAmistad.find({ to: userId, status: 'pendiente' })
    .populate('from', 'nombre nickname tag profileImageUrl');
  res.json({ solicitudes });
};
exports.aceptarSolicitud = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const solicitud = await SolicitudAmistad.findOne({ _id: id, to: userId, status: "pendiente" });
  if (!solicitud) return res.status(404).json({ error: "Solicitud no encontrada" });

  solicitud.status = "aceptada";
  await solicitud.save();

  // Opcional: añade cada uno a la lista de amigos del otro
  await User.findByIdAndUpdate(userId, { $addToSet: { amigos: solicitud.from } });
  await User.findByIdAndUpdate(solicitud.from, { $addToSet: { amigos: userId } });

  await achievementService.checkAndAwardAchievements(userId, 'FRIEND_REQUEST_ACCEPTED', { 
    friendId: solicitud.from 
  });
  // También para el otro usuario
  await achievementService.checkAndAwardAchievements(solicitud.from, 'FRIEND_REQUEST_ACCEPTED', { 
    friendId: userId 
  });

  res.json({ ok: true });
};

exports.rechazarSolicitud = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const solicitud = await SolicitudAmistad.findOne({ _id: id, to: userId, status: "pendiente" });
  if (!solicitud) return res.status(404).json({ error: "Solicitud no encontrada" });

  solicitud.status = "rechazada";
  await solicitud.save();

  res.json({ ok: true });
};

exports.getAmigos = async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId)
    .populate("amigos", "nickname tag nombre profileImageUrl");
  res.json({ amigos: user.amigos });
};