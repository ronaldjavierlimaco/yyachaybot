
const express = require("express");
const router = express.Router();

const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const teacherController = require('../controllers/teacher');

aws.config.update({
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: 'us-east-1' 
});

const s3 = new aws.S3();

const fileFilter = (req, files, cb) => {
  if (files.mimetype === 'application/pdf' || files.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || files.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'upload-file-fisi',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (request, file, cb) {
      console.log('Viendo el archivo: ', file)
      cb(null, file.originalname);
    }
	}),
	fileFilter: fileFilter
});

const uploadMultiple = (name) => upload.array(name);


router.get('/', teacherController.home);

router.get('/cursos', teacherController.getCourses);

router.get('/cursos/:id', teacherController.getCourse);

router.get('/cursos/:id/grupos/:idGroup/editar', teacherController.getUpdateGroup);
router.post('/cursos/:id/grupos/:idGroup/editar', teacherController.postUpdateGroup);

router.get('/cursos/:id/grupo/crear', teacherController.getCreateGroup);
router.post('/cursos/:id/grupo/crear', teacherController.postCreateGroup);

router.get('/chatbots/', teacherController.getChatbots);

router.get('/chatbots/:id', teacherController.getChatbot);

router.get('/chatbots/:id/intencion/crear', teacherController.getCreateIntention);
router.post('/chatbots/:id/intencion/crear',  uploadMultiple('archivo'), teacherController.postCreateIntention);

router.get('/chatbots/:id/editar', teacherController.getUpdateChatbot);
router.post('/chatbots/:id/editar', uploadMultiple('archivo'), teacherController.postUpdateChatbot);

router.get('/chatbots/:id/intencion/:idI/editar', teacherController.getUpdateIntention);
router.post('/chatbots/:id/intencion/:idI/editar', teacherController.postUpdateIntention);

router.get('/chatbots/:id/editar/informacion', teacherController.getUpdateChatbotInfo);
router.post('/chatbots/:id/editar/informacion', teacherController.postUpdateChatbotInfo);

router.get('/chatbot/crear', teacherController.getCreateChatbot);
router.post('/chatbot/crear', teacherController.postCreateChatbot);

router.get('/curso/crear', teacherController.getCreateCourse);
router.post('/curso/crear', teacherController.postCreateCourse);


module.exports = router;