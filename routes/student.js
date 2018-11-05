

const express = require("express");
const router = express.Router();

const studentController = require('../controllers/student');

router.get('/', studentController.home);

router.get('/cursos', studentController.getCourses);

router.get('/cursos/:id', studentController.getCourse);

router.get('/cursos/:id/matriculado', studentController.getCourseEnroll);

router.get('/cursos/:idCourse/grupos/:idGroup/matricularse', studentController.postEnroll);

router.get('/cursosmatriculados', studentController.coursesEnrollment);

router.get('/cursosmatriculados/chatbot/:id', studentController.coursesEnrollChatbot);

module.exports = router;