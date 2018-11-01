
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

router.get('/chatbots/', teacherController.getChatbots);

router.get('/chatbots/:id', teacherController.getChatbot);

router.get('/chatbots/:id/editar', teacherController.getUpdateChatbot);
router.post('/chatbots/:id/editar', teacherController.postUpdateChatbot);

router.get('/chatbot/crear', teacherController.getCreateChatbot);
router.post('/chatbot/crear', teacherController.postCreateChatbot);

router.get('/curso/crear', teacherController.getCreateCourse);
router.post('/curso/crear', teacherController.postCreateCourse);


module.exports = router;