

const express = require("express");
const router = express.Router();

const adminController = require('../controllers/admin');

router.get('/', adminController.home);

router.get('/usuarios', adminController.getUsers);

router.get('/usuarios/:id', adminController.getUser);

router.get('/usuarios/:id/editar', adminController.getUpdateUser);
router.post('/usuarios/:id/editar', adminController.postUpdateUser);
router.post('/usuarios/:id/contrasenia', adminController.postUpdatePassword);

router.get('/usuario/crear', adminController.getCreateUser);
router.post('/usuario/crear', adminController.postCreateUser);

module.exports = router;