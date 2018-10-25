
const express = require("express");
const router = express.Router();

const userController = require('../controllers/user');

router.get('/registro', userController.getSignup);
router.post('/registro', userController.postSignup);

router.get('/ingreso', userController.getLogin);
router.post('/ingreso', userController.postLogin);

router.get('/salir', userController.logout);

router.get('/recuperarcontrasena', userController.getForgot);
router.post('/recuperarcontrasena', userController.postForgot);

router.get('/reiniciarcontrasena/:token', userController.getReset);
router.post('/reiniciarcontrasena/:token', userController.postReset);

module.exports = router;
