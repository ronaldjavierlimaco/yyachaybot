
const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');
const Course = require('../models/Course');
const Group = require('../models/Group')

exports.home = (req, res) => {
  res.render('home', {
    title: 'Inicio'
  });
};

exports.getCourses = (req, res) => {
  Course
  .find({ idTeacher: req.user._id })
  .exec((err, getCourses) => {
    if (err) return res.status(500).json({ err })

    res.render('teacher/courses', {
      title: 'Ver cursos asignados',
      cursos: getCourses
    });
  })
}

exports.getCourse = (req, res) => {
  Course
  .findOne({ _id: req.params.id, idTeacher: req.user._id })
  .populate('idTeacher')
  .exec((err, course) => {
    if (err) return res.status(500).json({ err })

    Group
    .find({ idCourse: course._id })
    .exec((err, getGroups) => {
      if (err) return res.status(500).json({ err })
      console.log(getGroups)
      res.render('teacher/course', {
        title: 'Ver curso',
        curso: course,
        grupos: getGroups
      });
    })
  })
}

exports.getCreateGroup = (req, res) => {
  Course
  .findById(req.params.id)
  .exec((err, course) => {
    if (err) return res.status(500).json({ err })
    console.log(course)
    res.render('teacher/createGroup', {
      title: 'Crear grupo',
      curso: course
    })
  })
}

exports.postCreateGroup = (req, res) => {
  // return res.send(req.body)
  var newGroup = new Group({
    title: req.body.title,
    description: req.body.description,
    idCourse: req.body.idCourse
  })

  newGroup.save((err, createGroup) => {
    if (err) return res.status(500).json({ err })
    console.log(createGroup)
    req.flash('success', { msg: `El grupo ha sido creado` });
    res.redirect(`/profesor/cursos/${createGroup.idCourse}`)
  })
}

exports.getUpdateGroup = (req, res) => {
  Group
  .findOne({ _id: req.params.idGroup, idCourse: req.params.id })
  .exec((err, getGroup) => {
    if (err) return res.status(500).json({ err })
    res.render('teacher/updateGroup', {
      title: 'Editar Grupo',
      grupo: getGroup
    })
  })
}

exports.postUpdateGroup = (req, res) => {
  // return res.send(req.body)
  Group
  .findById(req.params.idGroup)
  .exec((err, group) => {
    if (err) return res.status(500).json({ err })
    group.title = req.body.title || group.title;
    group.description = req.body.description || group.description;

    group.save((err, savedGroup) => {
      if (err) return res.status(500).json({ err })
      req.flash('success', { msg: `El grupo ha sido actualizado` });
      res.redirect(`/profesor/cursos/${savedGroup.idCourse}`)
    })
  })
}