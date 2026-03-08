/**
 * Bank statement CSV parser
 * Supports common formats: date, description, amount (or debit/credit columns)
 */

import { parse } from 'csv-parse/sync';
import { categorizeTransaction } from './categorizer.service';

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: string;
}

/**
 * Parse CSV buffer into structured transactions
 * Handles various bank CSV formats
 */
export function parseBankStatementCSV(csvBuffer: Buffer): ParsedTransaction[] {
  const records = parse(csvBuffer, {
    bom: true,
    trim: true,
    relax_column_count: true,
    skip_empty_lines: true,
    columns: (header) => header.map((h: string) => (h || '').trim().toLowerCase()),
  });

  if (!records.length) return [];

  const firstRow = records[0];
  const keys = Object.keys(firstRow);

  // Detect column mapping
  const dateCol = keys.find(k => 
    /date|posted|trans.*date/i.test(k)
  ) || keys[0];

  const descCol = keys.find(k => 
    /description|memo|details|narrative|merchant/i.test(k)
  ) || keys.find(k => k.includes('desc')) || keys[1];

  const amountCol = keys.find(k => 
    /^amount$|debit|credit/i.test(k)
  );
  const debitCol = keys.find(k => /debit/i.test(k));
  const creditCol = keys.find(k => /credit/i.test(k));

  const transactions: ParsedTransaction[] = [];

  for (const row of records) {
    const dateStr = row[dateCol] || row[keys[0]];
    const desc = row[descCol] || row[keys[1]] || '';

    let amount = 0;
    if (amountCol) {
      const val = String(row[amountCol] || '').replace(/[,$\s]/g, '');
      amount = parseFloat(val) || 0;
    } else if (debitCol && creditCol) {
      const debit = parseFloat(String(row[debitCol] || '').replace(/[,$\s]/g, '')) || 0;
      const credit = parseFloat(String(row[creditCol] || '').replace(/[,$\s]/g, '')) || 0;
      amount = credit - debit; // Positive = income, Negative = expense
    }

    if (!dateStr || isNaN(amount)) continue;

    // Normalize date to YYYY-MM-DD
    const date = normalizeDate(dateStr);
    if (!date) continue;

    const type = amount >= 0 ? 'income' : 'expense';
    const category = categorizeTransaction(desc, amount);

    transactions.push({
      date,
      description: String(desc).trim().slice(0, 500),
      amount,
      category,
      type,
    });
  }

  return transactions;
}

function normalizeDate(dateStr: string): string | null {
  const s = String(dateStr).trim();
  // ISO format
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  // US format MM/DD/YYYY or MM-DD-YYYY
  const us = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/.exec(s);
  if (us) {
    const [, m, d, y] = us;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // DD/MM/YYYY
  const eu = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/.exec(s);
  if (eu) {
    const [, d, m, y] = eu;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  return null;
}
