
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');

exports.getProfile = (req, res) => {
  res.render('profile/profile', {
    title: 'Ver Perfil'
  });
};

exports.getUpdateProfile = (req, res) => {
  res.render('profile/updateProfile', {
    title: 'Editar Perfil'
  });
};

exports.postUpdateProfile = (req, res, next) => {
  req.assert('email', 'Por favor, introduce una dirección de correo electrónico válida.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/perfil');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.email = req.body.email || user.email;
    user.names = req.body.names || user.names;
    user.surnames = req.body.surnames || user.surnames;
    user.profile.gender = req.body.gender || user.profile.gender;
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: 'La dirección de correo electrónico que ha ingresado ya está asociada con una cuenta.' });
          return res.redirect('/perfil');
        }
        return next(err);
      }
      req.flash('success', { msg: 'La información del perfil ha sido actualizada.' });
      res.redirect('/perfil');
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
// exports.postUpdatePassword = (req, res, next) => {
//   req.assert('password', 'Password must be at least 4 characters long').len(4);
//   req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

//   const errors = req.validationErrors();

//   if (errors) {
//     req.flash('errors', errors);
//     return res.redirect('/account');
//   }

//   User.findById(req.user.id, (err, user) => {
//     if (err) { return next(err); }
//     user.password = req.body.password;
//     user.save((err) => {
//       if (err) { return next(err); }
//       req.flash('success', { msg: 'Password has been changed.' });
//       res.redirect('/account');
//     });
//   });
// };