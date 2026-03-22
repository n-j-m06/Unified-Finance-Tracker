import React, { useState, useEffect } from 'react';
import API from '../utils/api';

function ExpenseModal({ state, currency, fmt, today, loadAll, showToast }) {
    const [isOpen, setIsOpen] = useState(false);
    const [item, setItem] = useState('');
    const [qty, setQty] = useState(1);
    const [unitPrice, setUnitPrice] = useState(0);
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [accountId, setAccountId] = useState('');
    const [date, setDate] = useState(today());
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            setDate(today());
            if (state.categories.length > 0 && !categoryId) {
                const defaultCat = state.categories.find(c => c.name === 'Shopping');
                setCategoryId(defaultCat?.id || state.categories[0]?.id);
            }
            if (state.accounts.length > 0 && !accountId) {
                const defaultAcc = state.accounts.find(a => a.name === 'Cash');
                setAccountId(defaultAcc?.id || state.accounts[0]?.id);
            }
        }
    }, [isOpen, state.categories, state.accounts]);

    const calcExpenseTotal = () => {
        if (unitPrice > 0) {
            setAmount((qty * unitPrice).toFixed(2));
        }
    };

    const clearUnitCalc = () => {
        setQty(1);
        setUnitPrice(0);
    };

    const saveExpense = async () => {
        if (!item || !amount || !accountId) {
            showToast('Please fill all required fields', 'error');
            return;
        }
        const r = await API('POST', '/expenses', {
            item,
            amount: parseFloat(amount),
            category_id: categoryId,
            account_id: accountId,
            date,
            notes,
            quantity: qty,
            unit_price: unitPrice
        });
        if (r.error) {
            showToast(r.error, 'error');
        } else {
            showToast('Expense added!', 'success');
            closeModal();
            await loadAll();
        }
    };

    const closeModal = () => {
        setIsOpen(false);
        setItem('');
        setQty(1);
        setUnitPrice(0);
        setAmount('');
        setNotes('');
    };

    useEffect(() => {
        const modal = document.getElementById('expenseModal');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setIsOpen(modal.classList.contains('show'));
                }
            });
        });
        if (modal) {
            observer.observe(modal, { attributes: true });
        }
        return () => observer.disconnect();
    }, []);

    if (!isOpen) return null;

    return (
        <div id="expenseModal" className="modal show">
            <div className="modal-content">
                <h3 className="modal-title">Add Expense</h3>
                <div className="form-group">
                    <label>Item Name</label>
                    <input 
                        type="text" 
                        placeholder="e.g., Coffee"
                        value={item}
                        onChange={(e) => setItem(e.target.value)}
                    />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Quantity</label>
                        <input 
                            type="number" 
                            value={qty} 
                            min="0.01" 
                            step="any"
                            onChange={(e) => {
                                setQty(parseFloat(e.target.value) || 1);
                                calcExpenseTotal();
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <label>Unit Price</label>
                        <input 
                            type="number" 
                            value={unitPrice} 
                            step="any"
                            onChange={(e) => {
                                setUnitPrice(parseFloat(e.target.value) || 0);
                                calcExpenseTotal();
                            }}
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Total Amount</label>
                        <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                clearUnitCalc();
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select 
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                            {state.categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Account</label>
                        <select 
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                        >
                            {state.accounts.map(a => (
                                <option key={a.id} value={a.id}>{a.name} ({fmt(a.balance)})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>Notes (optional)</label>
                    <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                </div>
                <div className="modal-actions">
                    <button className="btn" onClick={closeModal}>Cancel</button>
                    <button className="btn btn-green" onClick={saveExpense}>Save Expense</button>
                </div>
            </div>
        </div>
    );
}

export default ExpenseModal;