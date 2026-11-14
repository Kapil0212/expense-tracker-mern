import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createExpense, deleteExpense, getExpenses, getSummary, updateExpense } from '../controllers/expenseController.js';

const router = Router();
router.use(protect);
router.get('/', getExpenses);
router.get('/summary', getSummary);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);
export default router;
