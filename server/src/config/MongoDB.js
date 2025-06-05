const mongoose = require('mongoose');
const { MONGO_URI } = require('./ENVConfig');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI); // Sin opciones obsoletas
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    process.exit(1); // Salir del proceso si falla la conexión
  }
};

module.exports = connectDB;