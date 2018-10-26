
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  title: String,
  description: String,
  idCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }

}, { timestamps: true });

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
