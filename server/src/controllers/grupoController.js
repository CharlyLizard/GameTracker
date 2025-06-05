const Grupo = require("../models/Grupo");
const MensajeGrupo = require("../models/MensajeGrupo");
const User = require("../models/Usuario");
const achievementService = require("../services/achievementService"); // Asegúrate de que la ruta sea correcta

// Crear grupo
exports.crearGrupo = async (req, res) => {
  try {
    const { nombre, descripcion, imagen } = req.body;
    if (!nombre) return res.status(400).json({ error: "Nombre requerido" });

    const existe = await Grupo.findOne({ nombre });
    if (existe) return res.status(400).json({ error: "Ya existe un grupo con ese nombre" });

    const grupo = await Grupo.create({
      nombre,
      descripcion,
      imagen,
      miembros: [{ user: req.user.id, rol: "lider" }],
      creadoPor: req.user.id,
    });

    // Verificar logros después de crear el grupo
    await achievementService.checkAndAwardAchievements(req.user.id, 'GROUP_CREATED', {
      groupId: grupo._id,
      groupName: grupo.nombre,
    });

    res.status(201).json({ ok: true, grupo });
  } catch (err) {
    console.error("Error al crear grupo:", err); // Es bueno loguear el error completo
    res.status(500).json({ error: "Error al crear grupo" });
  }
};

// Listar grupos
exports.listarGrupos = async (req, res) => {
  const grupos = await Grupo.find().select("nombre descripcion imagen miembros creadoEn");
  res.json({ grupos });
};

// Detalle de grupo
exports.detalleGrupo = async (req, res) => {
  const grupo = await Grupo.findById(req.params.id).populate("miembros.user", "nickname tag profileImageUrl");
  if (!grupo) return res.status(404).json({ error: "Grupo no encontrado" });
  res.json({ grupo });
};

// Unirse a grupo
exports.unirseGrupo = async (req, res) => {
  const grupo = await Grupo.findById(req.params.id);
  if (!grupo) return res.status(404).json({ error: "Grupo no encontrado" });
  if (grupo.miembros.some(m => m.user.equals(req.user.id)))
    return res.status(400).json({ error: "Ya eres miembro" });
  grupo.miembros.push({ user: req.user.id, rol: "miembro" });
  await grupo.save();
  await achievementService.checkAndAwardAchievements(req.user.id, 'GROUP_JOINED', { 
    groupId: grupo._id 
  });
  res.json({ ok: true });
};

// Salir de grupo
exports.salirGrupo = async (req, res) => {
  const grupo = await Grupo.findById(req.params.id);
  if (!grupo) return res.status(404).json({ error: "Grupo no encontrado" });
  grupo.miembros = grupo.miembros.filter(m => !m.user.equals(req.user.id));
  await grupo.save();
  res.json({ ok: true });
};

// Obtener mensajes del grupo
exports.getMensajesGrupo = async (req, res) => {
  const mensajes = await MensajeGrupo.find({ grupoId: req.params.id })
    .populate('from', 'nickname profileImageUrl tag') // Popular datos del remitente
    .sort({ date: 1 });
  res.json({ mensajes });
};

exports.misGrupos = async (req, res) => {
  const grupos = await Grupo.find({ "miembros.user": req.user.id })
    .populate('creadoPor', 'nickname tag')
    .populate('miembros.user', 'nickname tag profileImageUrl') // Popular detalles de miembros
    .select("nombre descripcion imagen miembros creadoEn");
  res.json({ grupos });
};

// Actualizar rol de un miembro
exports.actualizarRolMiembro = async (req, res) => {
  try {
    const { nuevoRol } = req.body; // nuevoRol sí viene del body
    const { grupoId, miembroUserId } = req.params; // Obtener miembroUserId de req.params
    const grupo = req.grupo; // Obtenido del middleware
    const rolUsuarioActual = req.rolUsuarioActualEnGrupo;

    if (!['admin', 'miembro'].includes(nuevoRol)) {
      return res.status(400).json({ error: 'Rol no válido.' });
    }

    const miembroAActualizar = grupo.miembros.find(m => m.user.equals(miembroUserId));
    if (!miembroAActualizar) {
      return res.status(404).json({ error: 'Miembro no encontrado en el grupo.' });
    }

    // Restricciones:
    // 1. Un líder no puede ser degradado por un admin.
    // 2. Un líder solo puede ser cambiado por otro líder (transferencia de liderazgo, más complejo, para después).
    // 3. Un admin no puede modificar a otro admin (a menos que sea el líder).
    // 4. No se puede auto-modificar el rol.
    if (miembroAActualizar.user.equals(req.user.id)) {
        return res.status(400).json({ error: 'No puedes modificar tu propio rol.' });
    }
    if (miembroAActualizar.rol === 'lider') {
      return res.status(403).json({ error: 'El rol de líder no puede ser modificado de esta manera.' });
    }
    if (rolUsuarioActual === 'admin' && miembroAActualizar.rol === 'admin') {
      return res.status(403).json({ error: 'Un administrador no puede modificar a otro administrador.' });
    }

    miembroAActualizar.rol = nuevoRol;
    await grupo.save();
    
    const grupoActualizado = await Grupo.findById(grupoId)
        .populate('creadoPor', 'nickname tag')
        .populate('miembros.user', 'nickname tag profileImageUrl');

    res.json({ ok: true, message: 'Rol actualizado correctamente.', grupo: grupoActualizado });
  } catch (err) {
    console.error("Error al actualizar rol:", err);
    res.status(500).json({ error: 'Error al actualizar rol del miembro.' });
  }
};

// Expulsar a un miembro
exports.expulsarMiembro = async (req, res) => {
  try {
    const { miembroUserId } = req.params; // miembroUserId es el ID del usuario a expulsar
    const { grupoId } = req.params;
    const grupo = req.grupo; // Obtenido del middleware
    const rolUsuarioActual = req.rolUsuarioActualEnGrupo;

    const miembroAExpulsar = grupo.miembros.find(m => m.user.equals(miembroUserId));
    if (!miembroAExpulsar) {
      return res.status(404).json({ error: 'Miembro no encontrado en el grupo.' });
    }

    // Restricciones:
    // 1. Un líder no puede ser expulsado.
    // 2. Un admin no puede expulsar a otro admin (a menos que sea el líder).
    // 3. No se puede auto-expulsar.
    if (miembroAExpulsar.user.equals(req.user.id)) {
        return res.status(400).json({ error: 'No puedes expulsarte a ti mismo (usa "Salir del grupo").' });
    }
    if (miembroAExpulsar.rol === 'lider') {
      return res.status(403).json({ error: 'El líder del grupo no puede ser expulsado.' });
    }
    if (rolUsuarioActual === 'admin' && miembroAExpulsar.rol === 'admin') {
      return res.status(403).json({ error: 'Un administrador no puede expulsar a otro administrador.' });
    }

    grupo.miembros = grupo.miembros.filter(m => !m.user.equals(miembroUserId));
    await grupo.save();

    // Devolver el grupo actualizado con miembros poblados para el frontend
    const grupoActualizado = await Grupo.findById(grupoId)
        .populate('creadoPor', 'nickname tag')
        .populate('miembros.user', 'nickname tag profileImageUrl');

    res.json({ ok: true, message: 'Miembro expulsado correctamente.', grupo: grupoActualizado });
  } catch (err) {
    console.error("Error al expulsar miembro:", err);
    res.status(500).json({ error: 'Error al expulsar miembro.' });
  }
};

// Actualizar detalles de un grupo (nombre, descripción)
exports.actualizarDetallesGrupo = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const { grupoId } = req.params;
    const grupo = req.grupo; // Obtenido del middleware esLiderOAdminDelGrupo

    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ error: 'El nombre del grupo no puede estar vacío.' });
    }

    // Verificar si ya existe otro grupo con el nuevo nombre (si el nombre cambió)
    if (nombre !== grupo.nombre) {
      const existeOtroGrupoConEseNombre = await Grupo.findOne({ nombre: nombre, _id: { $ne: grupoId } });
      if (existeOtroGrupoConEseNombre) {
        return res.status(400).json({ error: 'Ya existe otro grupo con ese nombre.' });
      }
    }

    grupo.nombre = nombre;
    grupo.descripcion = descripcion || ""; // Si la descripción es undefined, poner string vacío

    await grupo.save();

    // Devolver el grupo actualizado con miembros poblados para el frontend
    const grupoActualizado = await Grupo.findById(grupoId)
      .populate('creadoPor', 'nickname tag')
      .populate('miembros.user', 'nickname tag profileImageUrl');

    res.json({ ok: true, message: 'Detalles del grupo actualizados correctamente.', grupo: grupoActualizado });
  } catch (err) {
    console.error("Error al actualizar detalles del grupo:", err);
    res.status(500).json({ error: 'Error al actualizar los detalles del grupo.' });
  }
};

// Eliminar un grupo (solo el líder)
exports.eliminarGrupo = async (req, res) => {
  try {
    const { grupoId } = req.params;
    // El middleware esLiderDelGrupo ya ha verificado que el usuario es el líder
    // y ha adjuntado el grupo a req.grupo.

    // Eliminar mensajes del grupo
    await MensajeGrupo.deleteMany({ grupoId: grupoId });

    // Eliminar el grupo
    await Grupo.findByIdAndDelete(grupoId);

    res.json({ ok: true, message: 'Grupo eliminado correctamente.' });
  } catch (err) {
    console.error("Error al eliminar el grupo:", err);
    res.status(500).json({ error: 'Error al eliminar el grupo.' });
  }
};