
const express = require("express");
const router = express.Router();

const profileController = require('../controllers/profile');

router.get('/', profileController.getProfile);

router.get('/editar', profileController.getUpdateProfile);
router.post('/editar', profileController.postUpdateProfile);

module.exports = router;
