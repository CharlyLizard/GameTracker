const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { searchUsers } = require('../controllers/searchController');

// Endpoint de búsqueda de usuarios
router.get('/users', authMiddleware, searchUsers);

module.exports = router;