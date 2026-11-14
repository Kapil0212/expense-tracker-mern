import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value || 0);
const today = () => new Date().toISOString().slice(0, 10);
const blankForm = () => ({ title: '', amount: '', type: 'expense', category: 'Food', date: today(), note: '' });
const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Education', 'Salary', 'Business', 'Other'];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, transactionCount: 0 });
  const [form, setForm] = useState(blankForm());
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [expenseResponse, summaryResponse] = await Promise.all([
        api.get('/expenses', { params: filter === 'all' ? {} : { type: filter } }),
        api.get('/expenses/summary')
      ]);
      setExpenses(expenseResponse.data.expenses);
      setSummary(summaryResponse.data);
    } catch (err) {
      const message = err.response?.data?.message || 'Could not load your transactions.';
      setError(message);
      if (err.response?.status === 401) { logout(); navigate('/login'); }
    } finally { setLoading(false); }
  }, [filter, logout, navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  const visibleExpenses = useMemo(() => expenses, [expenses]);
  function openAdd() { setEditingId(null); setForm(blankForm()); setError(''); setShowForm(true); }
  function openEdit(item) {
    setEditingId(item._id);
    setForm({ title: item.title, amount: String(item.amount), type: item.type, category: item.category, date: new Date(item.date).toISOString().slice(0, 10), note: item.note || '' });
    setError(''); setShowForm(true);
  }
  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setNotice('');
    if (!form.title.trim() || !form.amount || Number(form.amount) <= 0 || !form.category || !form.date) return setError('Please fill all required fields with a valid amount.');
    setSaving(true);
    try {
      if (editingId) await api.put(`/expenses/${editingId}`, form);
      else await api.post('/expenses', form);
      setShowForm(false); setForm(blankForm()); setEditingId(null);
      setNotice(editingId ? 'Transaction updated.' : 'Transaction added.');
      await loadData();
    } catch (err) { setError(err.response?.data?.message || 'Unable to save transaction.'); }
    finally { setSaving(false); }
  }
  async function handleDelete(id) {
    if (!window.confirm('Delete this transaction permanently?')) return;
    setError(''); setNotice('');
    try { await api.delete(`/expenses/${id}`); setNotice('Transaction deleted.'); await loadData(); }
    catch (err) { setError(err.response?.data?.message || 'Unable to delete transaction.'); }
  }
  function handleLogout() { logout(); navigate('/login'); }

  return <div className="dashboard-page">
    <header className="dashboard-nav">
      <a className="brand" href="/dashboard"><span className="brand-mark">◈</span><span>MyWebLink</span></a>
      <div className="nav-right"><span className="welcome-user">Hello, {user?.name}</span><button className="logout-btn" onClick={handleLogout}>Logout</button></div>
    </header>
    <main className="dashboard-main">
      <div className="dashboard-heading"><div><div className="eyebrow">YOUR MONEY OVERVIEW</div><h1>Dashboard</h1><p className="muted">Track your income and expenses in one place.</p></div><button className="primary-btn add-top-btn" onClick={openAdd}>＋ Add transaction</button></div>
      {notice && <p className="notice-message">{notice}</p>}
      {error && !showForm && <p className="message error dashboard-error">{error}</p>}
      <section className="summary-grid">
        <article className="summary-card"><span className="summary-label">Total balance</span><strong>{money(summary.balance)}</strong><span className="summary-hint">Income minus expenses</span></article>
        <article className="summary-card income-card"><span className="summary-label">Total income</span><strong>{money(summary.totalIncome)}</strong><span className="summary-hint">Money received</span></article>
        <article className="summary-card expense-card"><span className="summary-label">Total expenses</span><strong>{money(summary.totalExpense)}</strong><span className="summary-hint">Money spent</span></article>
        <article className="summary-card"><span className="summary-label">Transactions</span><strong>{summary.transactionCount}</strong><span className="summary-hint">All recorded entries</span></article>
      </section>
      <section className="transactions-panel">
        <div className="panel-heading"><div><h2>Recent transactions</h2><p className="muted">Your latest income and expenses</p></div><select aria-label="Filter transactions" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All transactions</option><option value="income">Income only</option><option value="expense">Expenses only</option></select></div>
        {loading ? <div className="empty-state">Loading transactions...</div> : visibleExpenses.length === 0 ? <div className="empty-state"><div className="empty-icon">↗</div><h3>No transactions yet</h3><p>Add your first income or expense to get started.</p><button className="primary-btn" onClick={openAdd}>Add transaction</button></div> :
          <div className="table-wrap"><table className="transactions-table"><thead><tr><th>Transaction</th><th>Category</th><th>Date</th><th>Amount</th><th>Actions</th></tr></thead><tbody>
            {visibleExpenses.map((item) => <tr key={item._id}><td><div className="transaction-title">{item.title}</div>{item.note && <div className="transaction-note">{item.note}</div>}</td><td><span className="category-pill">{item.category}</span></td><td>{new Date(item.date).toLocaleDateString('en-IN')}</td><td className={item.type === 'income' ? 'amount-income' : 'amount-expense'}>{item.type === 'income' ? '+' : '−'}{money(item.amount)}</td><td><div className="action-buttons"><button onClick={() => openEdit(item)} aria-label={`Edit ${item.title}`}>Edit</button><button className="delete-action" onClick={() => handleDelete(item._id)} aria-label={`Delete ${item.title}`}>Delete</button></div></td></tr>)}
          </tbody></table></div>}
      </section>
    </main>
    {showForm && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}><section className="transaction-modal"><div className="modal-heading"><div><div className="eyebrow">TRANSACTION DETAILS</div><h2>{editingId ? 'Edit transaction' : 'Add transaction'}</h2></div><button className="close-btn" onClick={() => setShowForm(false)} aria-label="Close">×</button></div>
      <form onSubmit={handleSubmit}>
        <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Monthly salary" maxLength="100" required /></label>
        <div className="form-two-col"><label>Amount (₹)<input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required /></label><label>Type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="expense">Expense</option><option value="income">Income</option></select></label></div>
        <div className="form-two-col"><label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label></div>
        <label>Note (optional)<textarea rows="3" maxLength="300" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Add a short note" /></label>
        {error && <p className="message error">{error}</p>}
        <div className="modal-actions"><button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-btn" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Add transaction'}</button></div>
      </form>
    </section></div>}
  </div>;
}
