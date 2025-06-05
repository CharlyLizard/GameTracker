require('dotenv').config();

const ENV = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT || 3000,
  RAWG_API_KEY: process.env.RAWG_API_KEY, 
};

console.log('Variables de entorno cargadas:', ENV);

module.exports = ENV;