/**
 * Dashboard - Financial overview, charts, monthly summary
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportsApi } from '../api/reports';
import type { MonthlySummary } from '../api/reports';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Upload, LogOut, DollarSign, TrendingUp, TrendingDown, Receipt } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff', '#f3e8ff'];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reportsApi.summary()
      .then(({ data }) => setSummary(data))
      .catch(() => setError('Failed to load summary'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const netAmount = (summary?.totalIncome ?? 0) - (summary?.totalExpenses ?? 0);
  const pieData = summary?.byCategory?.map((c, i) => ({
    name: c.category,
    value: c.total,
    fill: COLORS[i % COLORS.length],
  })) ?? [];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>ProsperAI</h1>
        <nav className="nav-links">
          <button onClick={() => navigate('/upload')} className="btn-ghost">
            <Upload size={18} /> Upload CSV
          </button>
          <button onClick={() => navigate('/insights')} className="btn-ghost">
            AI Insights
          </button>
          <span className="user-name">{user?.fullName}</span>
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </header>

      <main className="dashboard-main">
        <h2>Financial Overview</h2>
        {error && <div className="error-banner">{error}</div>}

        <div className="summary-cards">
          <div className="summary-card income">
            <TrendingUp size={24} />
            <div>
              <span className="label">Income</span>
              <span className="value">${(summary?.totalIncome ?? 0).toFixed(2)}</span>
            </div>
          </div>
          <div className="summary-card expense">
            <TrendingDown size={24} />
            <div>
              <span className="label">Expenses</span>
              <span className="value">${(summary?.totalExpenses ?? 0).toFixed(2)}</span>
            </div>
          </div>
          <div className="summary-card net">
            <DollarSign size={24} />
            <div>
              <span className="label">Net</span>
              <span className={`value ${netAmount >= 0 ? 'positive' : 'negative'}`}>
                ${netAmount.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="summary-card count">
            <Receipt size={24} />
            <div>
              <span className="label">Transactions</span>
              <span className="value">{summary?.transactionCount ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="charts-row">
          <div className="chart-card">
            <h3>Expenses by Category</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={pieData[i].fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number | undefined) => v != null ? `$${v.toFixed(2)}` : ''} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">Upload a CSV to see your expense breakdown</div>
            )}
          </div>
          <div className="chart-card">
            <h3>Top Categories (Bar)</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={pieData.slice(0, 6)} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                  <YAxis type="category" dataKey="name" width={70} />
                  <Tooltip formatter={(v: number | undefined) => v != null ? `$${v.toFixed(2)}` : ''} />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">No data yet</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
