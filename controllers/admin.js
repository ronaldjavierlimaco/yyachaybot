
const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');
const Book = require('../models/Book');

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