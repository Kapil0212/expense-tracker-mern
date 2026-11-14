import mongoose from 'mongoose';
import Expense from '../models/Expense.js';

const validTypes = ['income', 'expense'];
function validateExpense(body) {
  const { title, amount, type, category, date, note } = body;
  if (!title?.trim() || title.trim().length > 100) return 'Title is required (maximum 100 characters).';
  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) return 'Amount must be greater than zero.';
  if (!validTypes.includes(type)) return 'Type must be income or expense.';
  if (!category?.trim()) return 'Category is required.';
  if (date && Number.isNaN(new Date(date).getTime())) return 'Please provide a valid date.';
  if (note && note.length > 300) return 'Note must be 300 characters or fewer.';
  return null;
}

export async function getExpenses(req, res, next) {
  try {
    const { type, category, from, to } = req.query;
    const filter = { user: req.userId };
    if (type && validTypes.includes(type)) filter.type = type;
    if (category) filter.category = category;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });
    res.json({ expenses });
  } catch (error) { next(error); }
}

export async function createExpense(req, res, next) {
  try {
    const message = validateExpense(req.body);
    if (message) return res.status(400).json({ message });
    const expense = await Expense.create({ ...req.body, amount: Number(req.body.amount), user: req.userId });
    res.status(201).json({ message: 'Transaction added successfully.', expense });
  } catch (error) { next(error); }
}

export async function updateExpense(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid transaction ID.' });
    const message = validateExpense(req.body);
    if (message) return res.status(400).json({ message });
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { ...req.body, amount: Number(req.body.amount) },
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ message: 'Transaction not found.' });
    res.json({ message: 'Transaction updated successfully.', expense });
  } catch (error) { next(error); }
}

export async function deleteExpense(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid transaction ID.' });
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!expense) return res.status(404).json({ message: 'Transaction not found.' });
    res.json({ message: 'Transaction deleted successfully.' });
  } catch (error) { next(error); }
}

export async function getSummary(req, res, next) {
  try {
    const [result] = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.userId) } },
      { $group: {
        _id: null,
        totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
        totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
        transactionCount: { $sum: 1 }
      } }
    ]);
    const totalIncome = result?.totalIncome || 0;
    const totalExpense = result?.totalExpense || 0;
    res.json({ totalIncome, totalExpense, balance: totalIncome - totalExpense, transactionCount: result?.transactionCount || 0 });
  } catch (error) { next(error); }
}
