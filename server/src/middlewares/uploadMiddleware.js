const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurarse de que el directorio de subidas exista
const uploadDir = path.join(__dirname, '../../public/uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Nombre de archivo único: userId-fieldname-timestamp.extension
    const userId = req.user ? req.user.id : 'temp'; // req.user debería estar disponible por authMiddleware
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${userId}-${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Filtro de archivos para aceptar solo imágenes
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('¡Solo se permiten archivos de imagen!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // Límite de 5MB por archivo (ajusta según necesites)
  }
});

module.exports = upload;