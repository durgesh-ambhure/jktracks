import { useEffect, useState, useCallback } from 'react';
import { Package, CheckCircle2, IndianRupee, Truck, XCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';
import DataTable from '../../components/common/DataTable';
import ErrorState from '../../components/common/ErrorState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import ShipmentTracker from '../../components/dashboard/ShipmentTracker';
import dashboardService from '../../services/dashboard.service';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';

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
  const recentShipments = d.recentShipments || [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your shipment operations"
        actions={<ShipmentTracker />}
      />

      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <StatsCard
          variant="booked"
          label="Total Docket Booked"
          value={formatNumber(d.totalShipments)}
          icon={Package}
        />
        <StatsCard
          variant="delivered"
          label="Total Docket Delivered"
          value={formatNumber(d.delivered)}
          icon={CheckCircle2}
        />
        <StatsCard
          variant="sales"
          label="Total Sales of Booked Docket"
          value={formatCurrency(d.revenue)}
          icon={IndianRupee}
        />
        <StatsCard
          variant="inTransit"
          label="Total Docket In-Transit"
          value={formatNumber(d.inTransit)}
          icon={Truck}
        />
        <StatsCard
          variant="cancelled"
          label="Total Docket Cancel"
          value={formatNumber(d.cancelled)}
          icon={XCircle}
        />
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
          className="data-table-wrap--compact"
        />
      </div>
    </div>
  );
}
