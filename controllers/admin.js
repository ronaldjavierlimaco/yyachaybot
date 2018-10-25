
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
