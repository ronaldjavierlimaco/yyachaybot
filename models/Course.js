const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: String,
  eap: Number,
  cycle: Number,
  description: String,
  image: String,
  idTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  idCreatorAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
