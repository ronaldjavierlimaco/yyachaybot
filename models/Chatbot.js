

const mongoose = require('mongoose');

const chatbotSchema = new mongoose.Schema({
  name: String,
  description: String,
  learningProfile: String,
  intentions: [String],
  entities: [String],
  creatorTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  photo: {type: String, default: 'https://cdn-images-1.medium.com/max/1200/1*QVnVYYqQ6Wx4B74kOM-VFQ.png'},
  
  credentials: {
    projectId: String,
    clientEmail: String,
    privateKey: String
  }

}, { timestamps: true, usePushEach: true });

const Chatbot = mongoose.model('Chatbot', chatbotSchema);

module.exports = Chatbot;