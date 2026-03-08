/**
 * Insights page - AI-powered financial advice
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiApi } from '../api/ai';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Sparkles, PiggyBank, Wallet } from 'lucide-react';

export default function Insights() {
  const [advice, setAdvice] = useState('');
  const [savings, setSavings] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState<'advice' | 'savings' | 'budget' | null>(null);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchAdvice = async () => {
    setLoading('advice');
    setError('');
    try {
      const { data } = await aiApi.advice();
      setAdvice(data.advice);
    } catch (err) {
      setError('Failed to fetch advice');
    } finally {
      setLoading(null);
    }
  };

  const fetchSavings = async () => {
    setLoading('savings');
    setError('');
    try {
      const { data } = await aiApi.savings();
      setSavings(data.recommendations);
    } catch (err) {
      setError('Failed to fetch savings recommendations');
    } finally {
      setLoading(null);
    }
  };

  const fetchBudget = async () => {
    setLoading('budget');
    setError('');
    try {
      const { data } = await aiApi.budget();
      setBudget(data.suggestions);
    } catch (err) {
      setError('Failed to fetch budget suggestions');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="insights-page">
      <header className="dashboard-header">
        <h1>ProsperAI</h1>
        <nav className="nav-links">
          <button onClick={() => navigate('/dashboard')} className="btn-ghost">
            <ArrowLeft size={18} /> Dashboard
          </button>
          <span className="user-name">{user?.fullName}</span>
        </nav>
      </header>

      <main className="insights-main">
        <h2>AI Financial Insights</h2>
        <p className="insights-intro">
          Get personalized financial advice based on your transaction history. Upload transactions first for better insights.
        </p>
        {error && <div className="error-msg">{error}</div>}

        <div className="insight-cards">
          <div className="insight-card">
            <div className="insight-header">
              <Sparkles size={24} />
              <h3>Financial Advice</h3>
              <button onClick={fetchAdvice} disabled={!!loading}>
                {loading === 'advice' ? 'Generating...' : 'Get Advice'}
              </button>
            </div>
            {advice && <div className="insight-content">{advice}</div>}
          </div>

          <div className="insight-card">
            <div className="insight-header">
              <PiggyBank size={24} />
              <h3>Savings Recommendations</h3>
              <button onClick={fetchSavings} disabled={!!loading}>
                {loading === 'savings' ? 'Generating...' : 'Get Recommendations'}
              </button>
            </div>
            {savings && <div className="insight-content">{savings}</div>}
          </div>

          <div className="insight-card">
            <div className="insight-header">
              <Wallet size={24} />
              <h3>Budget Suggestions</h3>
              <button onClick={fetchBudget} disabled={!!loading}>
                {loading === 'budget' ? 'Generating...' : 'Get Suggestions'}
              </button>
            </div>
            {budget && <div className="insight-content">{budget}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
