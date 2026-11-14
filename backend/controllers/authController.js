import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(409).json({ message: 'An account already exists with this email.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: hashedPassword });
    return res.status(201).json({
      message: 'Account created successfully.',
      token: createToken(user._id.toString()),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) { next(error); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    return res.json({
      message: 'Login successful.',
      token: createToken(user._id.toString()),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) { next(error); }
}

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('name email createdAt');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { next(error); }
}
