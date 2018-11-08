
const mongoose = require('mongoose');

const credentialsAgentSchema = new mongoose.Schema({
  projectId: String,
  clientEmail: String,
  privateKey: String

}, { timestamps: true, usePushEach: true  });

const CredentialsAgent = mongoose.model('CredentialsAgent', credentialsAgentSchema);

module.exports = CredentialsAgent;
