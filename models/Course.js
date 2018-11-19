const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: String,
  eap: Number,
  cycle: Number,
  description: String,
  image: {type: String, default: 'https://image.freepik.com/vector-gratis/diferentes-elementos-colegio-estilo-pizarra_23-2147774585.jpg'},
  idTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  idCreatorAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  idChatbot: {type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot'}

}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
