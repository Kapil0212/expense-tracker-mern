import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  amount: { type: Number, required: true, min: 0.01 },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true, trim: true, maxlength: 40 },
  date: { type: Date, required: true, default: Date.now },
  note: { type: String, trim: true, maxlength: 300, default: '' }
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
