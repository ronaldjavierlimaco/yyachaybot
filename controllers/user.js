const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/login', {
    title: 'Login'
  });
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  req.assert('email', 'El correo no es válido').isEmail();
  req.assert('password', 'La contraseña no puede estar en blanco').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/usuario/ingreso');
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('errors', info);
      return res.redirect('/usuario/ingreso');
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: `¡Bienvenido ${user.names.split(' ')[0]} ${user.surnames.split(' ')[0]}!` });
      if (user.type == 1) {
        res.redirect(req.session.returnTo || '/admin');
      } 
      else if (user.type == 2){
        res.redirect(req.session.returnTo || '/alumno');
      }
      else {
        res.redirect(req.session.returnTo || '/profesor');
      }
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  req.logout();
  res.redirect('/');
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/signup', {
    title: 'Create Account'
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
  req.assert('email', 'El correo no es válido').isEmail();
  req.assert('password', 'La contraseña debe tener al menos 4 caracteres').len(4);
  req.assert('confirmPassword', 'Las contraseñas no coinciden').equals(req.body.password);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/usuario/registro');
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
    names: req.body.names,
    surnames: req.body.surnames,
    type: 2 //creando tipo de usuario estudiante
  });

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) return res.status(500).json({ err })
    if (existingUser) {
      req.flash('errors', { msg: 'La cuenta con esa dirección de correo electrónico ya existe.' });
      return res.redirect('/usuario/registro');
    }
    user.save((err) => {
      if (err) return res.status(500).json({ err })
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (err) { return next(err); }
      if (!user) {
        req.flash('errors', { msg: 'El token de restablecimiento de contraseña no es válido o ha caducado.' });
        return res.redirect('/usuario/recuperarcontraseña');
      }
      res.render('account/reset', {
        title: 'Restablecimiento de contraseña'
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
  req.assert('password', 'La contraseña debe tener al menos 4 caracteres.').len(4);
  req.assert('confirm', 'Las contraseñas deben coincidir.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function resetPassword(done) {
      User
        .findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
          if (err) { return next(err); }
          if (!user) {
            req.flash('errors', { msg: 'El token de restablecimiento de contraseña no es válido o ha caducado.' });
            return res.redirect('back');
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save((err) => {
            if (err) { return next(err); }
            req.logIn(user, (err) => {
              done(err, user);
            });
          });
        });
    },
    function sendResetPasswordEmail(user, done) {
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'chatbotunmsm@gmail.com',
        subject: 'Tu contraseña de Yachaybot ha sido cambiada',
        text: `Hola,\n\n Esta es una confirmación de que la contraseña de su cuenta ${user.email} acaba de cambiarse.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('success', { msg: '¡Genial! Tu contraseña ha sido cambiada.' });
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Por favor, introduce una dirección de correo electrónico válida.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function createRandomToken(done) {
      crypto.randomBytes(16, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    function setRandomToken(token, done) {
      User.findOne({ email: req.body.email }, (err, user) => {
        if (err) { return done(err); }
        if (!user) {
          req.flash('errors', { msg: 'No existe una cuenta con ese correo.' });
          return res.redirect('back');
        }
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        user.save((err) => {
          done(err, token, user);
        });
      });
    },
    function sendForgotPasswordEmail(token, user, done) {
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'chatbotunmsm@gmail.com',
        subject: 'Reinicia tu contraseña en Yachaybot',
        text: `Hola. Has recibido este correo porque solicitaste (o quizá alguien más lo hizo) reestablecer tu contraseña en Yachaybot.\n
          Para esto, solo tienes que ingresar al siguiente Link: \n\n
          http://${req.headers.host}/usuario/reiniciarcontrasena/${token}\n\n
          Si tu no fuiste el que lo solicitó, no hagas nada y tu cuenta permanecerá segura.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('info', { msg: `Se envió un correo a ${user.email} con las instrucciones para que pueda reestablecer su contraseña.` });
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect('back');
  });
};
