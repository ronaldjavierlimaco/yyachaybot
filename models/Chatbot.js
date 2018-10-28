
const mongoose = require('mongoose');

const chatbotSchema = new mongoose.Schema({
  name: String,
  description: String,
  learningProfile: String,
  intentions: [String],
  entities: [String],
  creatorTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }

}, { timestamps: true });

const Chatbot = mongoose.model('Chatbot', chatbotSchema);

module.exports = Chatbot;