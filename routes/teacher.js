
const express = require("express");
const router = express.Router();

const teacherController = require('../controllers/teacher');

router.get('/', teacherController.home);

router.get('/cursos', teacherController.getCourses);

router.get('/cursos/:id', teacherController.getCourse);

router.get('/cursos/:id/grupos/:idGroup/editar', teacherController.getUpdateGroup);
router.post('/cursos/:id/grupos/:idGroup/editar', teacherController.postUpdateGroup);

router.get('/cursos/:id/grupo/crear', teacherController.getCreateGroup);
router.post('/cursos/:id/grupo/crear', teacherController.postCreateGroup);

module.exports = router;