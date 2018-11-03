
const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');
const Course = require('../models/Course');
const Chatbot = require('../models/Chatbot');

exports.home = (req, res) => {
  res.render('home', {
    title: 'Inicio'
  });
};

exports.getUsers = (req, res) => {
  User
  .find()
  .exec((err, allUSers) => {
    if (err) return res.status(500).json({ err })
    console.log('Viendo todos los usuarios:', allUSers)
    res.render('admin/users', {
      usuarios: allUSers
    })
  })
}

exports.getUser = (req, res) => {
  User
  .findById(req.params.id)
  .exec((err, getUser) => {
    if (err) return res.status(500).json({ err })
    console.log(getUser)
    res.render('admin/user', {
      usuario: getUser
    })
  })
}

exports.getUpdateUser = (req, res) => {
  User
  .findById(req.params.id)
  .exec((err, getUser) => {
    if (err) return res.status(500).json({ err })
    console.log(getUser)
    res.render('admin/updateUser', {
      usuario: getUser
    })
  })
}

exports.postUpdateUser = (req, res) => {
  // return res.send(req.body)
  req.assert('email', 'Por favor, introduce una dirección de correo electrónico válida.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect(`/admin/usuarios/${req.params.id}`);
  }

  User.findById(req.params.id, (err, user) => {
    if (err) { return next(err); }
    user.email = req.body.email || user.email;
    user.names = req.body.names || user.names;
    user.surnames = req.body.surnames || user.surnames;
    user.type = req.body.type || user.type
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: 'La dirección de correo electrónico que ha ingresado ya está asociada con una cuenta.' });
          return res.redirect(`/admin/usuarios/${user._id}`);
        }
        return next(err);
      }
      req.flash('success', { msg: 'La información del usuario ha sido actualizada.' });
      res.redirect(`/admin/usuarios/${user._id}`);
    });
  });
}

exports.postUpdatePassword = (req, res, next) => {
  req.assert('password', 'La contraseña debe tener al menos 4 caracteres').len(4);
  req.assert('confirmPassword', 'Las contraseñas no coinciden').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect(`/admin/usuarios/${req.params.id}`);
  }

  User.findById(req.params.id, (err, user) => {
    console.log('Viendo el usuario con la contraseña cambiada: ', user)
    if (err) { return next(err); }
    user.password = req.body.password;
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: `La contraseña del usuario ${user.names} ha sido cambiada.` });
      res.redirect(`/admin/usuarios/${req.params.id}`);
    });
  });
};

exports.getCreateUser = (req, res) => {
  res.render('admin/createUser', {
    title: 'Crear usuario'
  });
}

exports.postCreateUser = (req, res) => {
  // return res.send(req.body)
  req.assert('email', 'El correo no es válido').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  const user = new User({
    email: req.body.email,
    names: req.body.names,
    surnames: req.body.surnames,
    type: req.body.type
  });

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) return res.status(500).json({ err })
    if (existingUser) {
      req.flash('errors', { msg: 'La cuenta con esa dirección de correo electrónico ya existe.' });
      return res.redirect('back');
    }
    user.save((err) => {
      if (err) return res.status(500).json({ err })
      res.redirect('/admin/usuarios');
    });
  });
}

exports.getCourses = (req, res) => {
  Course
  .find()
  .exec((err, allCourses) => {
    if (err) return res.status(500).json({ err })
    console.log(allCourses)
    res.render('admin/courses', {
      title: 'Ver cursos',
      cursos: allCourses
    })
  })
}

exports.getCreateCourse = (req, res) => {
  User
  .find({ type: 3 })
  .exec((err, getTeachers) => {
    if (err) return res.status(500).json({ err })
    console.log(getTeachers)
    res.render('admin/createCourse', {
      title: 'Crear curso',
      profesores: getTeachers
    })   
  })
}

exports.postCreateCourse = (req, res) => {
  // return res.send(req.body)
  const newCourse = new Course ({
    title: req.body.title,
    eap: req.body.eap,
    cycle: req.body.cycle,
    description: req.body.description,
    image: req.body.image,
    idTeacher: req.body.idTeacher,
    idCreatorAdmin: req.body.idCreatorAdmin
  })
  newCourse.save((err, createCourse) => {
    if (err) return res.status(500).json({ err })

    const newChatbot = new Chatbot({
      creatorTeacher: createCourse.idTeacher,
      course: createCourse._id
    })
    newChatbot.save((err, savedChatbot) => {
      if (err) return res.status(500).json({ err })
      
      newCourse.idChatbot = savedChatbot._id
      newCourse.save((err) => {
        if (err) return res.status(500).json({ err })

        req.flash('success', { msg: `El curso ha sido creado` });
        res.redirect('/admin/cursos');
      })
    })
  })
}

exports.getCourse = (req, res) => {
  Course
  .findById(req.params.id)
  .populate('idTeacher')
  .exec((err, getCourse) => {
    if (err) return res.status(500).json({ err })
    console.log(getCourse)
    res.render('admin/course', {
      curso: getCourse
    })
  })
}

exports.getUpdateCourse = (req, res) => {
  Course
  .findById(req.params.id)
  .populate('idTeacher')
  .exec((err, getCourse) => {
    if (err) return res.status(500).json({ err })
    console.log(getCourse)
    
    User
    .find({ type: 3 })
    .exec((err, allTeachers ) => {
      if (err) return res.status(500).json({ err })
      
      res.render('admin/updateCourse', {
        curso: getCourse,
        profesores: allTeachers
      })
    })
  })
}

exports.postUpdateCourse = (req, res) => {
  // return res.send(req.body)
  Course
  .findById(req.params.id)
  .exec((err, course) => {
    if (err) return res.status(500).json({ err })

    course.title = req.body.title || course.title
    course.eap = req.body.eap || course.eap
    course.cycle = req.body.cycle || course.cycle
    course.description = req.body.description || course.description
    course.image = req.body.image || course.image
    course.idTeacher = req.body.idTeacher || course.idTeacher

    course.save((err, editUser) => {
      if (err) return res.status(500).json({ err })
      req.flash('success', { msg: 'El curso ha sido actualizado.' });
      res.redirect(`/admin/cursos/${editUser._id}`);
    })
  })
}

