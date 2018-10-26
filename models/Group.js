
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  title: String,
  description: String,
  idCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },

  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

}, { timestamps: true, usePushEach: true  });

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
