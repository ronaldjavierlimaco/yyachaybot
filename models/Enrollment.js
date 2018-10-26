
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  idStudent:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  idCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  idGroup:  { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }

}, { timestamps: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
