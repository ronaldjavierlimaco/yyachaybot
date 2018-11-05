const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');
const Course = require('../models/Course');
const Group = require('../models/Group')
const Enrollment = require('../models/Enrollment');
const Chatbot = require('../models/Chatbot');

exports.home = (req, res) => {
  res.render('home', {
    title: 'Inicio'
  });
};

exports.getCourses = (req, res) => {
  Course
  .find()
  .populate('idTeacher')
  .exec((err, allCourse) => {
    if (err) return res.status(500).json({ err })
    console.log(allCourse)
    res.render('student/courses', {
      title: 'Ver cursos',
      cursos: allCourse
    });
  })
}

exports.getCourse = (req, res) => {
  Course
  .findById(req.params.id)
  .populate('idTeacher idChatbot')
  .exec((err, course) => {
    if (err) return res.status(500).json({ err })

    Group
    .find({ idCourse: course._id })
    .populate('students')
    .exec((err, getGroups) => {
      if (err) return res.status(500).json({ err })

      Enrollment
      .findOne({ idStudent: req.user._id, idCourse: course._id })
      .exec((err, enroll) => {
        console.log(enroll)
        if (err) return res.status(500).json({ err })

        res.render('student/course', {
          title: 'Ver Curso',
          curso: course,
          grupos: getGroups,
          matricula: enroll
        })
      })
    })  
  })
}

exports.postEnroll = (req, res) => {
  // return res.send(req.body)
  User
  .findById(req.user._id)
  .exec((err, user) => {
    if (err) return res.status(500).json({ err })

    const newEnrollment = new Enrollment({
      idStudent: user._id,
      idCourse: req.params.idCourse,
      idGroup: req.params.idGroup
    })

    newEnrollment.save((err, enroll) => {
      if (err) return res.status(500).json({ err })
      console.log(enroll)

      Group
      .findById(enroll.idGroup)
      .exec((err, group) => {
        if (err) return res.status(500).json({ err })
        group.students.push(enroll.idStudent)

        group.save((err, addStudent) => {
          if (err) return res.status(500).json({ err })
          console.log(addStudent)

          req.flash('success', { msg: `Matricula exitosa` });
          res.redirect('/alumno/cursos')
        })
      })
    })
  })
}

exports.coursesEnrollment = (req, res) => {
  Enrollment
  .find({ idStudent: req.user._id })
  .populate({ path:'idCourse', populate:{ path: 'idTeacher' }})
  .exec((err, course) => {
    if (err) return res.status(500).json({ err })
    console.log(course)
    res.render('student/coursesEnroll', {
      title: 'Ver cursos matriculados',
      cursos: course
    })
  })
}

exports.getCourseEnroll = (req, res) => {
  Course
  .findById(req.params.id)
  .populate('idTeacher idChatbot')
  .exec((err, course) => {
    console.log(course)
    if (err) return res.status(500).json({ err })
    
    Enrollment
    .findOne({ idStudent: req.user._id, idCourse: course._id })
    .exec((err, enroll) => {
      if (err) return res.status(500).json({ err })
      
      Group
      .findById(enroll.idGroup)
      .populate('students')
      .exec((err, group) => {
        if (err) return res.status(500).json({ err })

        res.render('student/courseEnroll', {
          title: 'Ver Curso',
          curso: course,
          grupo: group,
          matricula: enroll
        })
      })
    })  
  })
}

exports.coursesEnrollChatbot = (req, res) => {
  Chatbot
  .findById(req.params.id)
  .exec((err, chatbot) => {
    if (err) return res.status(500).json({ err })
    res.render('student/courseEnrollChatbot', {
      title: 'Conversando con el chatbot',
      chatbot
    })
  })
}