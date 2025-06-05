const MensajeChat = require('../models/MensajeChat');

// Obtener historial de chat
exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;
    const roomId = [userId, friendId].sort().join('_');
    const mensajes = await MensajeChat.find({ roomId }).sort({ date: 1 });
    res.json({ mensajes });
  } catch (error) {
    console.error('[getChatHistory] Error:', error);
    res.status(500).json({ error: 'Error al obtener el historial de chat' });
  }
};

// Subida de archivos de chat
exports.uploadChatFile = (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se subió ningún archivo" });
  const url = `/uploads/chat/${req.file.filename}`;
  res.json({
    ok: true,
    url,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype
  });
};