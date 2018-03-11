const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  
  code: Number,
  title: String,
  language: String,
  year: String,
  numberPages: Number,
  author: String ,
  category: String 

}, { timestamps: true });


const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
