
const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');
const Book = require('../models/Book');

//Logica para mostrar todos los usuarios
exports.getHome = (req,res) => {
  res.render('AD/home')
}

exports.getUser = (req,res) => {
  User
  .find()
  .exec((err,foundUser) => {
    if (err) return res.status(500).send(err)
    res.render('AD/usuarios', {
      usuarios: foundUser
    })
  })
}

//Logica para mostrar todos los libros
exports.getBooks = (req,res) => {
  Book
  .find()
  .exec((err, foundBook) => {
    if (err) return res.status(500).send(err)
    res.render('AD/libros', {
      libros: foundBook
    })
  })
}

exports.getCreateBook = (req,res) => {
  res.render('AD/agregarLibro')
}

exports.postCreateBook = (req,res) => {
  
  const newBook = new Book({
    code: req.body.code,
    title: req.body.title,
    language: req.body.language,
    year: req.body.year,
    numberPages: req.body.numberPages,
    author:  req.body.author,
    category: req.body.category
  })
  newBook.save((err, savedBook) => {
    if (err) return res.status(500).send(err)
    return res.redirect('/libros')
  }) 
}

exports.deleteBook = (req,res) => {
  Book
  .findByIdAndRemove(req.params.id)
  .exec((err, deleteBook) => {
    res.redirect('/libros')
  })
}