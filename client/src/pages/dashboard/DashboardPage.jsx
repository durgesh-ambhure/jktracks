import { useEffect, useState, useCallback } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import { Package, CheckCircle2, Clock, IndianRupee, AlertCircle, Wallet2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';
import ChartCard from '../../components/common/ChartCard';
import DataTable from '../../components/common/DataTable';
import ErrorState from '../../components/common/ErrorState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import dashboardService from '../../services/dashboard.service';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';

const PIE_COLORS = ['#3563e0', '#0ea5a0', '#d99a13', '#d9432f', '#6a2cc9', '#2f7bd9', '#7c8494'];

export default function DashboardPage() {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  const load = useCallback(async () => {
    setState({ loading: true, error: '', data: null });
    try {
      const res = await dashboardService.getSummary();
      setState({ loading: false, error: '', data: res.data });
    } catch (err) {
      setState({ loading: false, error: err.message, data: null });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (state.loading) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Overview of your shipment operations" />
        <LoadingSpinner label="Loading dashboard…" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Overview of your shipment operations" />
        <ErrorState message={state.error} onRetry={load} />
      </div>
    );
  }

  const d = state.data || {};
  const statusBreakdown = d.statusBreakdown || [];
  const revenueTrend = d.revenueTrend || [];
  const recentShipments = d.recentShipments || [];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your shipment operations" />

      <div className="grid-4" style={{ marginBottom: 'var(--space-6)' }}>
        <StatsCard label="Total Shipments" value={formatNumber(d.totalShipments)} icon={Package} />
        <StatsCard label="Delivered" value={formatNumber(d.delivered)} icon={CheckCircle2} />
        <StatsCard label="Pending" value={formatNumber(d.pending)} icon={Clock} />
        <StatsCard label="RTO" value={formatNumber(d.rto)} icon={AlertCircle} />
        <StatsCard label="Revenue" value={formatCurrency(d.revenue)} icon={IndianRupee} />
        <StatsCard label="Outstanding" value={formatCurrency(d.outstanding)} icon={AlertCircle} />
        <StatsCard label="COD Amount" value={formatCurrency(d.codAmount)} icon={Wallet2} />
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
        <ChartCard title="Status Breakdown" subtitle="Shipments by current status">
          {statusBreakdown.length === 0 ? (
            <div className="state-block"><span className="text-sm text-muted">No shipment data yet</span></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={entry.status} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Revenue Trend" subtitle="Revenue over recent periods">
          {revenueTrend.length === 0 ? (
            <div className="state-block"><span className="text-sm text-muted">No revenue data yet</span></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="revenue" stroke="#3563e0" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="card">
        <div className="card__header">
          <h3 className="card__title">Recent Shipments</h3>
        </div>
        <DataTable
          columns={[
            { key: 'awbNo', header: 'AWB No' },
            { key: 'client', header: 'Client', render: (r) => r.clientId?.name || r.client || '-' },
            { key: 'bookingDate', header: 'Booking Date', render: (r) => formatDate(r.bookingDate) },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            { key: 'amount', header: 'Amount', align: 'right', render: (r) => formatCurrency(r.amount, r.currency) },
          ]}
          rows={recentShipments}
          keyField="awbNo"
          emptyTitle="No recent shipments"
          emptyDescription="Newly booked shipments will show up here."
        />
      </div>
    </div>
  );
}
