/**
 * Dashboard - Financial overview, charts, monthly summary
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, type CategoryStat } from '../api/dashboard';
import { transactionsApi, type Transaction } from '../api/transactions';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

import {
  Upload,
  LogOut,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt
} from 'lucide-react';

const COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#c084fc',
  '#d8b4fe',
  '#e9d5ff',
  '#f3e8ff'
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [net, setNet] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, categoriesRes, txRes] = await Promise.all([
          dashboardApi.summary(),
          dashboardApi.categories(),
          transactionsApi.list(),
        ]);

        // Fix TypeScript mismatch
        const s = (summaryRes.data as any).summary;

        setIncome(s?.income ?? 0);
        setExpenses(s?.expenses ?? 0);
        setNet(s?.net ?? 0);
        setTransactionCount(s?.transactions ?? 0);

        setCategories(categoriesRes.data.categories ?? []);
        setTransactions(txRes.data.transactions ?? []);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    load();
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

  const pieData = categories.map((c, i) => ({
    name: c.category,
    value: c.totalAmount,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>ProsperAI</h1>

        <nav className="nav-links">
          <button
            onClick={() => navigate('/upload')}
            className="btn-ghost"
          >
            <Upload size={18} /> Upload CSV
          </button>

          <button
            onClick={() => navigate('/insights')}
            className="btn-ghost"
          >
            AI Insights
          </button>

          <span className="user-name">
            {user?.fullName}
          </span>

          <button
            onClick={handleLogout}
            className="btn-logout"
          >
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </header>

      <main className="dashboard-main">
        <h2>Financial Overview</h2>

        {error && (
          <div className="error-banner">{error}</div>
        )}

        <div className="summary-cards">

          <div className="summary-card income">
            <TrendingUp size={24} />
            <div>
              <span className="label">Income</span>
              <span className="value">
                ${income.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="summary-card expense">
            <TrendingDown size={24} />
            <div>
              <span className="label">Expenses</span>
              <span className="value">
                ${expenses.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="summary-card net">
            <DollarSign size={24} />
            <div>
              <span className="label">Net</span>
              <span
                className={`value ${
                  net >= 0 ? 'positive' : 'negative'
                }`}
              >
                ${net.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="summary-card count">
            <Receipt size={24} />
            <div>
              <span className="label">
                Transactions
              </span>
              <span className="value">
                {transactionCount}
              </span>
            </div>
          </div>
        </div>

        <div className="charts-row">

          <div className="chart-card">
            <h3>Expenses by Category</h3>

            {pieData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height={280}
              >
                <PieChart>

                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={pieData[i].fill}
                      />
                    ))}
                  </Pie>

                  {/* FIXED Tooltip */}
                  <Tooltip
                    formatter={(value) =>
                      `$${Number(value).toFixed(2)}`
                    }
                  />

                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                Upload a CSV to see your expense breakdown
              </div>
            )}
          </div>


          <div className="chart-card">
            <h3>Top Categories (Bar)</h3>

            {pieData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height={280}
              >
                <BarChart
                  data={pieData.slice(0, 6)}
                  layout="vertical"
                  margin={{ left: 80 }}
                >
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `$${v}`}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={70}
                  />

                  {/* FIXED Tooltip */}
                  <Tooltip
                    formatter={(value) =>
                      `$${Number(value).toFixed(2)}`
                    }
                  />

                  <Bar
                    dataKey="value"
                    fill="#6366f1"
                    radius={[0, 4, 4, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                No data yet
              </div>
            )}
          </div>
        </div>

        {transactions.length > 0 && (
          <div
            className="chart-card"
            style={{ marginTop: '1.5rem' }}
          >

            <h3>Recent Transactions</h3>

            <div
              style={{
                maxHeight: 260,
                overflowY: 'auto'
              }}
            >

              <table
                style={{
                  width: '100%',
                  fontSize: '0.9rem',
                  borderCollapse: 'collapse'
                }}
              >

                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {transactions
                    .slice(0, 10)
                    .map((t) => (
                      <tr key={t.id}>

                        <td>
                          {new Date(
                            t.date
                          ).toLocaleDateString()}
                        </td>

                        <td>{t.description}</td>

                        <td>
                          {t.category ||
                            'Uncategorized'}
                        </td>

                        <td
                          style={{
                            textAlign: 'right',
                            color:
                              t.amount >= 0
                                ? '#22c55e'
                                : '#f43f5e',
                          }}
                        >
                          {t.amount >= 0
                            ? '+'
                            : '-'}
                          $
                          {Math.abs(
                            t.amount
                          ).toFixed(2)}
                        </td>

                      </tr>
                    ))}
                </tbody>

              </table>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}