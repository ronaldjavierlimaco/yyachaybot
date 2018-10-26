

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

router.get('/cursos', adminController.getCourses);

router.get('/cursos/:id', adminController.getCourse);

router.get('/cursos/:id/editar', adminController.getUpdateCourse);
router.post('/cursos/:id/editar', adminController.postUpdateCourse);

router.get('/curso/crear', adminController.getCreateCourse);
router.post('/curso/crear', adminController.postCreateCourse);


module.exports = router;