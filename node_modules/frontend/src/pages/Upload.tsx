/**
 * Upload page - Bank statement CSV upload
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionsApi } from '../api/transactions';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ total: number; inserted: number } | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f ?? null);
    setResult(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await transactionsApi.upload(file);
      setResult({ total: data.total, inserted: data.inserted });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <header className="dashboard-header">
        <h1>ProsperAI</h1>
        <nav className="nav-links">
          <button onClick={() => navigate('/dashboard')} className="btn-ghost">
            <ArrowLeft size={18} /> Dashboard
          </button>
          <span className="user-name">{user?.fullName}</span>
        </nav>
      </header>

      <main className="upload-main">
        <h2>Upload Bank Statement (CSV)</h2>
        <p className="upload-hint">
          Upload a CSV file with columns for date, description, and amount. Common formats (Date, Description, Amount or Debit/Credit) are supported.
        </p>
        <form onSubmit={handleSubmit} className="upload-form">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="file-input"
          />
          <button type="submit" disabled={!file || loading}>
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
        {error && <div className="error-msg">{error}</div>}
        {result && (
          <div className="success-msg">
            Upload complete! Processed {result.total} transactions, {result.inserted} new records added.
          </div>
        )}
      </main>
    </div>
  );
}
