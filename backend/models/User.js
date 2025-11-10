// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // ✅ Must be 'bcryptjs', not 'bcrypt'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'librarian'], default: 'student' },
}, { timestamps: true });

// ✅ THIS HOOK MUST EXIST AND USE function() (not arrow)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);