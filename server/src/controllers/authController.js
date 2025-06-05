const User = require("../models/Usuario");
const Sesion = require("../models/Sesion");
const MensajeBuzon = require("../models/MensajeBuzon");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const crypto = require("crypto");
const fs = require("fs"); // Necesario para borrar archivos antiguos
const path = require("path"); // Necesario para construir rutas de archivo
const { enviarCorreoBienvenida } = require("../services/emailService");
const { enviarMensajeBuzon } = require("../utils/buzonUtils");
const { generateUniqueTag } = require("../utils/nicknameUtils"); // Asegúrate de crear este util
const multer = require("multer"); // Importar multer para instanceof
const achievementService = require('../services/achievementService'); // Importar el servicio

// Controlador para registrar un nuevo usuario
exports.register = async (req, res) => {
  const { nombre, nickname, email, password } = req.body;

  try {
    // Validaciones básicas
    if (!nombre || !nickname || !email || !password) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios." });
    }

    // Comprobar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya está registrado" });
    }

    // Comprobar si el nickname es válido (opcional: puedes añadir más reglas)
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(nickname)) {
      return res
        .status(400)
        .json({
          error:
            "El nickname solo puede contener letras, números y guiones bajos (3-20 caracteres).",
        });
    }

    // Generar tag único para el nickname
    const tag = await generateUniqueTag(nickname);

    // Crear token de verificación
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const { previewUrl } = await enviarCorreoBienvenida(
      email,
      nombre,
      verificationToken
    );

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const newUser = new User({
      nombre,
      nickname,
      tag,
      email,
      password: hashedPassword,
      verificationToken,
      verified: false,
    });
    await newUser.save();

    // Mensaje de bienvenida en el buzón
    await enviarMensajeBuzon({
      userId: newUser._id,
      subject: "¡Bienvenido a GameTracker!",
      sender: "Equipo GameTracker",
      body: `<h1>¡Hola ${nombre}!</h1><p>Gracias por registrarte en GameTracker. Revisa tu correo para verificar tu cuenta y disfruta de todas las funciones.</p>
             <p><a href="${previewUrl}" target="_blank" style="color: #a78bfa;">Ver correo de bienvenida</a></p>`,
    });

    // Registrar el logro de usuario registrado
    await achievementService.checkAndAwardAchievements(newUser._id, 'USER_REGISTERED', { 
      newUser: newUser.toObject() 
    });

    res.status(201).json({
      message: "Usuario registrado. Revisa tu correo para verificar la cuenta.",
      emailPreviewUrl: previewUrl,
      nickname,
      tag,
    });
  } catch (error) {
    console.error("[register] Error:", error);
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
};

// Controlador para iniciar sesión (login normal)
exports.login = async (req, res) => {
  const { email, password, publicIp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Si la cuenta no está verificada, no permitir login
    if (!user.verified) {
      return res
        .status(403)
        .json({ error: "Debes verificar tu cuenta antes de iniciar sesión." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Si el usuario tiene 2FA activado, notificar al frontend (no enviar token aún)
    if (user.twoFAEnabled) {
      // No crear sesión aquí todavía, se creará después de verificar 2FA
      return res.status(200).json({ require2FA: true, userId: user._id });
    }

    // Generar un token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Crear la sesión también para login sin 2FA
    const newSession = await Sesion.create({
      userId: user._id,
      userAgent: req.headers["user-agent"],
      ip: publicIp || req.ip,
      token: token, // Guardar el token en la sesión para posible invalidación específica
    });



    // Excluir campos sensibles
    const {
      _id,
      nombre: userName,
      email: userEmail,
      verified,
      twoFAEnabled: userTwoFAEnabled,
      createdAt,
      updatedAt,
      profileImageUrl,
      bannerImageUrl,
      bannerType,
      bannerColor,
    } = user;

    console.log("[LOGIN] Usuario autenticado:", {
      id: _id,
      nickname: user.nickname,
      tag: user.tag,
      nombre: userName,
      email: userEmail
    });
    res.status(200).json({
      token,
      user: {
        id: _id,
        nombre: userName,
        email: userEmail,
        verified,
        twoFAEnabled: userTwoFAEnabled,
        profileImageUrl,
        bannerImageUrl,
        bannerType,
        bannerColor,
        createdAt,
        updatedAt,
        nickname: user.nickname, // <-- Añadir esto
        tag: user.tag, // <-- Y esto
      },
      sesionId: newSession._id, // Devolver el ID de la sesión creada
    });
  } catch (error) {
    console.error("[login] Error:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};
// Controlador para verificar la cuenta del usuario
exports.verify = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res
      .status(400)
      .json({ error: "No se proporcionó token de verificación" });
  }

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res
        .status(400)
        .json({ error: "Token inválido o usuario no encontrado" });
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    // Enviar mensaje al buzón tras verificar
    await enviarMensajeBuzon({
      userId: user._id,
      subject: "¡Cuenta Verificada!",
      sender: "Equipo GameTracker",
      body: `<p>¡Felicidades, ${user.nombre}! Tu cuenta ha sido verificada correctamente. Ya puedes disfrutar de todas las funciones de GameTracker.</p>`,
    });

    // Registrar logro de verificación de email
    await achievementService.checkAndAwardAchievements(user._id, 'EMAIL_VERIFIED', { 
      user: user.toObject() 
    });

    res.status(200).json({ message: "Cuenta verificada correctamente" });
  } catch (error) {
    console.error("[verify] Error:", error);
    res
      .status(500)
      .json({ error: `Error al verificar la cuenta: ${error.message}` });
  }
};
// Endpoint para iniciar el setup de 2FA (genera secreto y QR)
exports.setup2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    if (user.twoFAEnabled) {
      return res.status(400).json({ error: "El 2FA ya está activado." });
    }

    const secret = speakeasy.generateSecret({
      name: `Gametracker (${user.email})`,
    });
    user.twoFASecret = secret.base32;
    await user.save();

    const qr = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ qr, secret: secret.base32 });
  } catch (error) {
    console.error("[setup2FA] Error:", error);
    res.status(500).json({ error: "Error al generar el 2FA" });
  }
};
// Endpoint para verificar el código y activar 2FA
exports.verify2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token: twoFACode } = req.body; // Renombrar para claridad

    if (
      !twoFACode ||
      typeof twoFACode !== "string" ||
      !/^\d{6}$/.test(twoFACode)
    ) {
      return res.status(400).json({ ok: false, error: "Código 2FA inválido" });
    }

    const user = await User.findById(userId);
    if (!user || !user.twoFASecret) {
      return res
        .status(400)
        .json({
          ok: false,
          error: "No hay secreto 2FA o usuario no encontrado",
        });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token: twoFACode,
      window: 1,
    });

    if (verified) {
      user.twoFAEnabled = true;
      await user.save();

      // Enviar mensaje al buzón
      await enviarMensajeBuzon({
        userId: user._id,
        subject: "Autenticación de Dos Factores (2FA) Activada",
        sender: "Seguridad GameTracker",
        body: `<p>La autenticación de dos factores (2FA) ha sido activada en tu cuenta. Si no reconoces esta actividad, por favor contacta con soporte inmediatamente.</p>`,
      });

      // Devolver el usuario actualizado para el frontend
      const {
        _id,
        nombre,
        email,
        verified: userVerified,
        twoFAEnabled,
        createdAt,
        updatedAt,
        profileImageUrl,
        bannerImageUrl,
        bannerType,
        bannerColor,
      } = user;
      return res.json({
        ok: true,
        user: {
          id: _id,
          nombre,
          email,
          verified: userVerified,
          twoFAEnabled,
          profileImageUrl,
          bannerImageUrl,
          bannerType,
          bannerColor,
          createdAt,
          updatedAt,
        },
      });
    } else {
      return res.status(400).json({ ok: false, error: "Código inválido" });
    }
  } catch (error) {
    console.error("[verify2FA] Error:", error);
    res
      .status(500)
      .json({ ok: false, error: "Error al verificar el código 2FA" });
  }
};
// Endpoint para desactivar 2FA
exports.disable2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    user.twoFASecret = undefined;
    user.twoFAEnabled = false;
    await user.save();

    // Enviar mensaje al buzón
    await enviarMensajeBuzon({
      userId: user._id,
      subject: "Autenticación de Dos Factores (2FA) Desactivada",
      sender: "Seguridad GameTracker",
      body: `<p>La autenticación de dos factores (2FA) ha sido desactivada en tu cuenta. Si no reconoces esta actividad, por favor contacta con soporte inmediatamente.</p>`,
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("[disable2FA] Error:", error);
    res.status(500).json({ ok: false, error: "Error al desactivar el 2FA" });
  }
};
// Controlador para login con 2FA
exports.login2FA = async (req, res) => {
  const { userId, code, publicIp } = req.body;

  if (!userId || !code) {
    return res.status(400).json({ error: "Faltan datos para el login 2FA" });
  }

  try {
    const user = await User.findById(userId);
    if (!user || !user.twoFAEnabled || !user.twoFASecret) {
      return res.status(400).json({ error: "Usuario o 2FA no válido" });
    }

    const isVerified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token: code,
      window: 1,
    });

    if (!isVerified) {
      return res.status(401).json({ error: "Código 2FA incorrecto" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const newSession = await Sesion.create({
      userId: user._id,
      userAgent: req.headers["user-agent"],
      ip: publicIp || req.ip,
      token: token, // Guardar el token en la sesión
    });

    // Excluir campos sensibles
    const {
      _id,
      nombre,
      email,
      verified,
      twoFAEnabled,
      createdAt,
      updatedAt,
      profileImageUrl,
      bannerImageUrl,
      bannerType,
      bannerColor,
      nickname, // Añadir nickname
      tag       // Añadir tag
    } = user;
    return res.json({
      token,
      user: {
        id: _id,
        nombre,
        email,
        verified,
        twoFAEnabled,
        profileImageUrl,
        bannerImageUrl,
        bannerType,
        bannerColor,
        createdAt,
        updatedAt,
        nickname: user.nickname, // Incluir nickname
        tag: user.tag       // Incluir tag
      },
      sesionId: newSession._id,
    });
  } catch (error) {
    console.error("[login2FA] Error:", error);
    res.status(500).json({ error: "Error en el login 2FA" });
  }
};
exports.check2FA = async (req, res) => {
  const { token } = req.query; // Token de reseteo de contraseña
  if (!token) return res.json({ twoFAEnabled: false });
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.json({ twoFAEnabled: false });
    res.json({ twoFAEnabled: !!user.twoFAEnabled });
  } catch (error) {
    console.error("[check2FA] Error:", error);
    res.json({ twoFAEnabled: false }); // En caso de error, asumir que no está habilitado o no se puede verificar
  }
};
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email requerido" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(200)
        .json({
          ok: true,
          message:
            "Si existe una cuenta con este correo, se enviará un enlace de recuperación.",
        }); // No revelar si existe

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 minutos
    await user.save();
    const { previewUrl } =
      await require("../services/emailService").enviarCorreoRecuperacion(
        user.email,
        user.nombre,
        token
      );

    await enviarMensajeBuzon({
      userId: user._id,
      subject: "Recuperación de Contraseña Solicitada",
      sender: "Soporte GameTracker",
      body: `<p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.<br>
      Si no fuiste tú, ignora este mensaje.<br>
      <a href="${previewUrl}" target="_blank" style="color: #a78bfa;">Ver correo de recuperación</a></p>`,
    });

    res.json({
      ok: true,
      message:
        "Si existe una cuenta con este correo, se enviará un enlace de recuperación.",
      emailPreviewUrl: previewUrl,
    });
  } catch (error) {
    console.error("[requestPasswordReset] Error:", error);
    return res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, twoFACode } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "El enlace ha expirado o es inválido" });
    }

    if (user.twoFAEnabled) {
      if (
        !twoFACode ||
        typeof twoFACode !== "string" ||
        !/^\d{6}$/.test(twoFACode)
      ) {
        return res.status(400).json({ error: "Código 2FA requerido" });
      }
      const verified = require("speakeasy").totp.verify({
        secret: user.twoFASecret,
        encoding: "base32",
        token: twoFACode,
        window: 1,
      });
      if (!verified) {
        return res.status(401).json({ error: "Código 2FA incorrecto" });
      }
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await enviarMensajeBuzon({
      userId: user._id,
      subject: "Contraseña restablecida",
      sender: "Soporte GameTracker",
      body: `<p>Tu contraseña ha sido restablecida correctamente.<br>Si no fuiste tú, contacta con soporte inmediatamente.</p>`,
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("[resetPassword] Error:", error);
    res.status(500).json({ error: "Error al restablecer la contraseña" });
  }
};
exports.getActiveSessions = async (req, res) => {
  try {
    const sesiones = await Sesion.find({
      userId: req.user.id,
      valid: true,
    }).sort({ lastActive: -1 });
    // Devolver también el ID de la sesión actual para que el frontend pueda destacarla
    res.json({ sesiones, currentSessionId: req.sesionId });
  } catch (error) {
    console.error("[getActiveSessions] Error:", error);
    res.status(500).json({ error: "Error al obtener las sesiones activas" });
  }
};
exports.logoutSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const sesion = await Sesion.findOne({
      _id: sessionId,
      userId: req.user.id,
    });
    if (!sesion) return res.status(404).json({ error: "Sesión no encontrada" });
    sesion.valid = false;
    await sesion.save();
    res.json({ ok: true });
  } catch (error) {
    console.error("[logoutSession] Error:", error);
    res.status(500).json({ error: "Error al cerrar la sesión" });
  }
};
exports.logoutAllSessions = async (req, res) => {
  try {
    // Invalidar todas las sesiones EXCEPTO la actual
    await Sesion.updateMany(
      { userId: req.user.id, valid: true, _id: { $ne: req.sesionId } },
      { valid: false }
    );
    res.json({ ok: true });
  } catch (error) {
    console.error("[logoutAllSessions] Error:", error);
    res.status(500).json({ error: "Error al cerrar todas las sesiones" });
  }
};
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword, twoFACode } = req.body;
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Contraseña actual incorrecta" });

    if (user.twoFAEnabled) {
      if (
        !twoFACode ||
        typeof twoFACode !== "string" ||
        !/^\d{6}$/.test(twoFACode)
      ) {
        return res.status(400).json({ error: "Código 2FA requerido" });
      }
      const verified = require("speakeasy").totp.verify({
        secret: user.twoFASecret,
        encoding: "base32",
        token: twoFACode,
        window: 1,
      });
      if (!verified) {
        return res.status(401).json({ error: "Código 2FA incorrecto" });
      }
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await enviarMensajeBuzon({
      userId: user._id,
      subject: "Contraseña cambiada correctamente",
      sender: "Soporte GameTracker",
      body: `<p>Tu contraseña ha sido cambiada correctamente.<br>Si no fuiste tú, contacta con soporte inmediatamente.</p>`,
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("[changePassword] Error:", error);
    res.status(500).json({ error: "Error al cambiar la contraseña" });
  }
};
exports.deleteAccount = async (req, res) => {
  const userId = req.user.id;
  const { password, twoFACode } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(400).json({ error: "Contraseña incorrecta" });

    if (user.twoFAEnabled) {
      if (
        !twoFACode ||
        typeof twoFACode !== "string" ||
        !/^\d{6}$/.test(twoFACode)
      ) {
        return res.status(400).json({ error: "Código 2FA requerido" });
      }
      const is2FAValid = require("speakeasy").totp.verify({
        secret: user.twoFASecret,
        encoding: "base32",
        token: twoFACode,
        window: 1,
      });
      if (!is2FAValid)
        return res.status(400).json({ error: "Código 2FA incorrecto" });
    }

    await enviarMensajeBuzon({
      userId: user._id,
      subject: "Cuenta eliminada",
      sender: "Soporte GameTracker",
      body: `<p>Tu cuenta ha sido eliminada. Lamentamos verte partir. Si fue un error, contacta con soporte lo antes posible.</p>`,
    });

    await MensajeBuzon.deleteMany({ userId });
    await User.deleteOne({ _id: userId }); // Corregido aquí
    await Sesion.deleteMany({ userId });

    res.json({ ok: true, message: "Cuenta eliminada correctamente" });
  } catch (err) {
    console.error("[deleteAccount] error:", err);
    res.status(500).json({ error: "Error al eliminar la cuenta" });
  }
};
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const {
      nombre,
      biografia,
      juegoFavorito,
      cumpleanos,
      plataformas,
      bannerType,
      bannerColor,
      profileImageUrl, // URL existente si no se sube archivo nuevo o se quiere borrar
      bannerImageUrl, // URL existente si no se sube archivo nuevo o se quiere borrar
    } = req.body;

    if (nombre) user.nombre = nombre;
    if (biografia !== undefined) user.biografia = biografia;
    if (juegoFavorito !== undefined) user.juegoFavorito = juegoFavorito;

    if (cumpleanos) {
      const date = new Date(cumpleanos);
      if (!isNaN(date.getTime())) {
        // Validar que la fecha sea válida
        user.cumpleanos = date;
      } else if (cumpleanos === "") {
        // Permitir borrar la fecha
        user.cumpleanos = null;
      }
    } else if (cumpleanos === "") {
      user.cumpleanos = null;
    }

    if (plataformas !== undefined) {
      user.plataformas = Array.isArray(plataformas)
        ? plataformas
        : plataformas
        ? [plataformas]
        : [];
    }

    // Manejo de imagen de perfil (avatar)
    if (
      req.files &&
      req.files.profileImageFile &&
      req.files.profileImageFile[0]
    ) {
      const newProfileImagePath = `/uploads/profiles/${req.files.profileImageFile[0].filename}`;
      if (
        user.profileImageUrl &&
        user.profileImageUrl.startsWith("/uploads/profiles/")
      ) {
        const oldPath = path.join(
          __dirname,
          "../../public",
          user.profileImageUrl
        );
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, (err) => {
            if (err)
              console.error("Error al borrar imagen de perfil antigua:", err);
          });
        }
      }
      user.profileImageUrl = newProfileImagePath;
    } else if (profileImageUrl === "") {
      // Si el usuario quiere borrar la imagen de perfil
      if (
        user.profileImageUrl &&
        user.profileImageUrl.startsWith("/uploads/profiles/")
      ) {
        const oldPath = path.join(
          __dirname,
          "../../public",
          user.profileImageUrl
        );
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, (err) => {
            if (err)
              console.error("Error al borrar imagen de perfil antigua:", err);
          });
        }
      }
      user.profileImageUrl = "";
    }

    // Manejo del banner
    if (bannerType) user.bannerType = bannerType;

    if (bannerType === "color" && bannerColor) {
      user.bannerColor = bannerColor;
      if (
        user.bannerImageUrl &&
        user.bannerImageUrl.startsWith("/uploads/profiles/")
      ) {
        const oldBannerPath = path.join(
          __dirname,
          "../../public",
          user.bannerImageUrl
        );
        if (fs.existsSync(oldBannerPath)) {
          fs.unlink(oldBannerPath, (err) => {
            if (err)
              console.error("Error al borrar imagen de banner antigua:", err);
          });
        }
      }
      user.bannerImageUrl = "";
    } else if (bannerType === "image") {
      if (
        req.files &&
        req.files.bannerImageFile &&
        req.files.bannerImageFile[0]
      ) {
        const newBannerImagePath = `/uploads/profiles/${req.files.bannerImageFile[0].filename}`;
        if (
          user.bannerImageUrl &&
          user.bannerImageUrl.startsWith("/uploads/profiles/")
        ) {
          const oldBannerPath = path.join(
            __dirname,
            "../../public",
            user.bannerImageUrl
          );
          if (fs.existsSync(oldBannerPath)) {
            fs.unlink(oldBannerPath, (err) => {
              if (err)
                console.error("Error al borrar imagen de banner antigua:", err);
            });
          }
        }
        user.bannerImageUrl = newBannerImagePath;
        user.bannerColor = "";
      } else if (bannerImageUrl === "") {
        if (
          user.bannerImageUrl &&
          user.bannerImageUrl.startsWith("/uploads/profiles/")
        ) {
          const oldBannerPath = path.join(
            __dirname,
            "../../public",
            user.bannerImageUrl
          );
          if (fs.existsSync(oldBannerPath)) {
            fs.unlink(oldBannerPath, (err) => {
              if (err)
                console.error("Error al borrar imagen de banner antigua:", err);
            });
          }
        }
        user.bannerImageUrl = "";
      }
    }

    await user.save();

    // Después de guardar, verificar logros relacionados con el perfil
    await achievementService.checkAndAwardAchievements(req.user.id, 'PROFILE_UPDATED', { 
      updatedProfile: user.toObject()
    });

    const {
      password: userPassword,
      verificationToken,
      resetPasswordToken,
      resetPasswordExpires,
      twoFASecret,
      ...userData
    } = user.toObject();

    res.json({
      ok: true,
      user: {
        ...userData,
        nickname: user.nickname, // Asegura que siempre se incluya
        tag: user.tag, // Asegura que siempre se incluya
      },
    });
  } catch (error) {
    console.error("[updateProfile] Error:", error);
    if (error instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ error: `Error al subir archivo: ${error.message}` });
    } else if (error.message === "¡Solo se permiten archivos de imagen!") {
      // Asumiendo que este es el error de tu filtro
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
};
