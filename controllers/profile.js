
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
  // return res.send(req.body)
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
    user.profile.photo = req.body.photo || user.profile.photo;
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