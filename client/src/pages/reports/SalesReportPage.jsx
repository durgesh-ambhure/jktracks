import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import FilterPanel from '../../components/common/FilterPanel';
import FormSelect from '../../components/common/FormSelect';
import FormDatePicker from '../../components/common/FormDatePicker';
import DataTable from '../../components/common/DataTable';
import StatsCard from '../../components/common/StatsCard';
import { IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';
import reportService from '../../services/report.service';
import customerService from '../../services/customer.service';
import { formatCurrency, formatDate } from '../../utils/formatters';

const GROUP_BY_OPTIONS = ['DAILY', 'MONTHLY', 'QUARTERLY', 'FY'];

export default function SalesReportPage() {
  const [filters, setFilters] = useState({ fromDate: '', toDate: '', groupBy: 'MONTHLY', clientId: '' });
  const [applied, setApplied] = useState(filters);
  const [clients, setClients] = useState([]);
  const [state, setState] = useState({ loading: true, error: '', rows: [], summary: null });

  useEffect(() => {
    customerService.list({ limit: 100 }).then((res) => setClients(res.data || [])).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const params = { ...applied };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await reportService.sales(params);
      const rows = res.data?.rows || res.data || [];
      setState({ loading: false, error: '', rows, summary: res.data?.summary || null });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [], summary: null });
    }
  }, [applied]);

  useEffect(() => {
    load();
  }, [load]);

  const clientOptions = useMemo(() => clients.map((c) => ({ value: c._id, label: c.name })), [clients]);

  const totals = state.summary || state.rows.reduce(
    (acc, r) => ({
      sales: acc.sales + (Number(r.sales) || 0),
      expense: acc.expense + (Number(r.expense) || 0),
      profit: acc.profit + (Number(r.profit) || 0),
    }),
    { sales: 0, expense: 0, profit: 0 }
  );

  return (
    <div>
      <PageHeader title="Sales Report" subtitle="Grouped sales, expense and profit rollups" />

      <FilterPanel onApply={() => setApplied(filters)} onClear={() => { const c = { fromDate: '', toDate: '', groupBy: 'MONTHLY', clientId: '' }; setFilters(c); setApplied(c); }}>
        <FormDatePicker label="From Date" value={filters.fromDate} onChange={(e) => setFilters((f) => ({ ...f, fromDate: e.target.value }))} />
        <FormDatePicker label="To Date" value={filters.toDate} onChange={(e) => setFilters((f) => ({ ...f, toDate: e.target.value }))} />
        <FormSelect label="Group By" options={GROUP_BY_OPTIONS} value={filters.groupBy} onChange={(e) => setFilters((f) => ({ ...f, groupBy: e.target.value }))} />
        <FormSelect label="Client" options={clientOptions} value={filters.clientId} onChange={(e) => setFilters((f) => ({ ...f, clientId: e.target.value }))} />
      </FilterPanel>

      <div className="grid-3" style={{ marginBottom: 'var(--space-5)' }}>
        <StatsCard label="Total Sales" value={formatCurrency(totals.sales)} icon={IndianRupee} />
        <StatsCard label="Total Expense" value={formatCurrency(totals.expense)} icon={TrendingDown} />
        <StatsCard label="Net Profit" value={formatCurrency(totals.profit)} icon={TrendingUp} />
      </div>

      <DataTable
        columns={[
          { key: 'period', header: 'Period', render: (r) => r.period || formatDate(r.date) },
          { key: 'sales', header: 'Sales', align: 'right', render: (r) => formatCurrency(r.sales) },
          { key: 'expense', header: 'Expense', align: 'right', render: (r) => formatCurrency(r.expense) },
          { key: 'profit', header: 'Profit', align: 'right', render: (r) => formatCurrency(r.profit) },
        ]}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        emptyTitle="No sales data for this range"
        emptyDescription="Adjust the date range or filters and try again."
      />
    </div>
  );
}
