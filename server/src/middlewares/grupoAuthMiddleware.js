const Grupo = require('../models/Grupo');

exports.esLiderOAdminDelGrupo = async (req, res, next) => {
  try {
    const { grupoId } = req.params;
    const userId = req.user.id;

    const grupo = await Grupo.findById(grupoId);
    if (!grupo) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    const miembroActual = grupo.miembros.find(m => m.user.equals(userId));
    if (!miembroActual || !['lider', 'admin'].includes(miembroActual.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para realizar esta acción en este grupo' });
    }

    req.grupo = grupo; // Adjuntar el grupo a la request para no buscarlo de nuevo en el controlador
    req.rolUsuarioActualEnGrupo = miembroActual.rol; // Adjuntar rol del usuario actual
    next();
  } catch (error) {
    console.error("Error en middleware esLiderOAdminDelGrupo:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.esLiderDelGrupo = async (req, res, next) => {
  try {
    const { grupoId } = req.params;
    const userId = req.user.id;

    const grupo = await Grupo.findById(grupoId);
    if (!grupo) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    const miembroActual = grupo.miembros.find(m => m.user.equals(userId));
    if (!miembroActual || miembroActual.rol !== 'lider') {
      return res.status(403).json({ error: 'Solo el líder del grupo puede realizar esta acción.' });
    }

    req.grupo = grupo; // Adjuntar el grupo a la request
    next();
  } catch (error) {
    console.error("Error en middleware esLiderDelGrupo:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};