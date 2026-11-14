import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { signup, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

router.post('/signup',
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 60 }).withMessage('Name is too long.'),
  body('email').trim().isEmail().withMessage('Please enter a valid email address.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
  validate, signup
);
router.post('/login',
  body('email').trim().isEmail().withMessage('Please enter a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
  validate, login
);
router.get('/me', protect, getMe);
export default router;
