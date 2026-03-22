import React, { useState } from 'react';
import API from '../utils/api';

function Savings({ state, currency, fmt, loadAll, showToast }) {
    const [newName, setNewName] = useState('');
    const [newTarget, setNewTarget] = useState('');
    const [newSaved, setNewSaved] = useState(0);
    const [newDeadline, setNewDeadline] = useState('');

    const addSavingsGoal = async () => {
        if (!newName || !newTarget) {
            showToast('Please fill required fields', 'error');
            return;
        }
        await API('POST', '/savings', {
            name: newName,
            target: parseFloat(newTarget),
            saved: parseFloat(newSaved) || 0,
            deadline: newDeadline
        });
        showToast('Savings goal added!', 'success');
        setNewName('');
        setNewTarget('');
        setNewSaved(0);
        setNewDeadline('');
        await loadAll();
    };

    const openSavingsContrib = (id) => {
        document.getElementById('savingsContribId').value = id;
        document.getElementById('savingsContribModal').classList.add('show');
    };

    const deleteSavings = async (id) => {
        if (!window.confirm('Delete this savings goal?')) return;
        await API('DELETE', `/savings/${id}`);
        showToast('Deleted', 'success');
        await loadAll();
    };

    return (
        <section id="savings" className="section active">
            <h2 className="section-title">Savings Goals</h2>

            <div className="card" style={{ marginBottom: '20px' }}>
                <h3>Add Savings Goal</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Goal Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g., Vacation Fund"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Target Amount</label>
                        <input 
                            type="number" 
                            placeholder="100000"
                            value={newTarget}
                            onChange={(e) => setNewTarget(e.target.value)}
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Already Saved</label>
                        <input 
                            type="number" 
                            value={newSaved}
                            onChange={(e) => setNewSaved(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Target Deadline</label>
                        <input 
                            type="date" 
                            value={newDeadline}
                            onChange={(e) => setNewDeadline(e.target.value)}
                        />
                    </div>
                </div>
                <button className="btn btn-green" onClick={addSavingsGoal}>Add Goal</button>
            </div>

            <div id="savingsList">
                {state.savings?.length > 0 ? state.savings.map(g => {
                    const pct = Math.min(Math.round((g.saved / g.target) * 100), 100);
                    const done = g.saved >= g.target;

                    return (
                        <div className="savings-item" key={g.id}>
                            <div className="account-header">
                                <span className="account-name">
                                    {g.name} {done && '✅'}
                                </span>
                                <span className="positive">
                                    {fmt(g.saved)} / {fmt(g.target)}
                                </span>
                            </div>
                            {g.deadline && (
                                <div style={{ fontSize: '13px', color: '#777' }}>
                                    Target: {g.deadline}
                                </div>
                            )}
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ 
                                        width: `${pct}%`, 
                                        background: done ? '#27ae60' : '#3498db' 
                                    }}
                                ></div>
                            </div>
                            <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>
                                {pct}% reached {done && '— Goal achieved! 🎉'}
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                {!done && (
                                    <button 
                                        className="btn btn-small btn-green" 
                                        onClick={() => openSavingsContrib(g.id)}
                                    >
                                        + Add Savings
                                    </button>
                                )}
                                <button 
                                    className="btn btn-small btn-red" 
                                    onClick={() => deleteSavings(g.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                }) : (
                    <p style={{ color: '#777', padding: '20px' }}>No savings goals yet.</p>
                )}
            </div>
        </section>
    );
}

export default Savings;