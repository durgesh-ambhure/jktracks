import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Download, Eye, Pencil, Ban } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import FilterPanel from '../../components/common/FilterPanel';
import FormSelect from '../../components/common/FormSelect';
import FormDatePicker from '../../components/common/FormDatePicker';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import shipmentService from '../../services/shipment.service';
import customerService from '../../services/customer.service';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { usePermission } from '../../hooks/usePermission';
import { SHIPMENT_STATUS_OPTIONS, PAYMENT_TYPE_OPTIONS, PACKET_TYPE_OPTIONS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function ShipmentListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const canCreate = usePermission('shipments.create');
  const canUpdate = usePermission('shipments.update');

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search);
  const [filters, setFilters] = useState({ status: '', clientId: '', paymentType: '', packetType: '', fromDate: '', toDate: '' });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [clients, setClients] = useState([]);
  const { page, limit, setPage, setLimit } = usePagination();

  const [state, setState] = useState({ loading: true, error: '', rows: [], pagination: null });
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    customerService.list({ limit: 100 }).then((res) => setClients(res.data || [])).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const params = { search: debouncedSearch, page, limit, ...appliedFilters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await shipmentService.list(params);
      setState({ loading: false, error: '', rows: res.data || [], pagination: res.pagination });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [], pagination: null });
    }
  }, [debouncedSearch, page, limit, appliedFilters]);

  useEffect(() => {
    load();
  }, [load]);

  const clientOptions = useMemo(() => clients.map((c) => ({ value: c._id, label: c.name })), [clients]);

  const applyFilters = () => {
    setPage(1);
    setAppliedFilters(filters);
  };
  const clearFilters = () => {
    const cleared = { status: '', clientId: '', paymentType: '', packetType: '', fromDate: '', toDate: '' };
    setFilters(cleared);
    setAppliedFilters(cleared);
    setPage(1);
  };

  const handleExport = async () => {
    try {
      const res = await shipmentService.exportCsv({ search: debouncedSearch, ...appliedFilters });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'shipments-export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      // eslint-disable-next-line no-alert
      alert('Export failed. The backend export endpoint may not be reachable yet.');
    }
  };

  const confirmCancel = async () => {
    setCancelling(true);
    try {
      await shipmentService.cancel(cancelTarget._id, cancelReason);
      setCancelTarget(null);
      setCancelReason('');
      load();
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const columns = [
    { key: 'awbNo', header: 'AWB No', render: (r) => <a href={`/shipments/${r._id}`} onClick={(e) => { e.preventDefault(); navigate(`/shipments/${r._id}`); }}>{r.awbNo}</a> },
    { key: 'client', header: 'Client', render: (r) => r.clientId?.name || '-' },
    { key: 'vendor', header: 'Vendor', render: (r) => r.forwarding?.vendorId?.name || '-' },
    { key: 'bookingDate', header: 'Booking Date', render: (r) => formatDate(r.bookingDate) },
    { key: 'paymentType', header: 'Payment' },
    { key: 'packetType', header: 'Packet' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'amount', header: 'Amount', align: 'right', render: (r) => formatCurrency(r.amount, r.currency) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <div className="flex gap-1 justify-end">
          <button type="button" className="btn btn-ghost btn-sm btn-icon-only" title="View" onClick={() => navigate(`/shipments/${r._id}`)}>
            <Eye size={15} />
          </button>
          {canUpdate && (
            <button type="button" className="btn btn-ghost btn-sm btn-icon-only" title="Edit" onClick={() => navigate(`/shipments/${r._id}/edit`)}>
              <Pencil size={15} />
            </button>
          )}
          {canUpdate && r.status !== 'CANCELLED' && (
            <button type="button" className="btn btn-ghost btn-sm btn-icon-only" title="Cancel" onClick={() => setCancelTarget(r)}>
              <Ban size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Shipments"
        subtitle="Booking report — search, filter and manage all shipments"
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={handleExport}>
              <Download size={15} /> Export CSV
            </button>
            {canCreate && (
              <button type="button" className="btn btn-primary" onClick={() => navigate('/shipments/create')}>
                <Plus size={15} /> New Shipment
              </button>
            )}
          </>
        }
      />

      <div style={{ marginBottom: 'var(--space-4)', maxWidth: 360 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by AWB, ref no…" />
      </div>

      <FilterPanel onApply={applyFilters} onClear={clearFilters}>
        <FormDatePicker label="From Date" value={filters.fromDate} onChange={(e) => setFilters((f) => ({ ...f, fromDate: e.target.value }))} />
        <FormDatePicker label="To Date" value={filters.toDate} onChange={(e) => setFilters((f) => ({ ...f, toDate: e.target.value }))} />
        <FormSelect label="Client" options={clientOptions} value={filters.clientId} onChange={(e) => setFilters((f) => ({ ...f, clientId: e.target.value }))} />
        <FormSelect label="Status" options={SHIPMENT_STATUS_OPTIONS} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} />
        <FormSelect label="Payment Type" options={PAYMENT_TYPE_OPTIONS} value={filters.paymentType} onChange={(e) => setFilters((f) => ({ ...f, paymentType: e.target.value }))} />
        <FormSelect label="Packet Type" options={PACKET_TYPE_OPTIONS} value={filters.packetType} onChange={(e) => setFilters((f) => ({ ...f, packetType: e.target.value }))} />
      </FilterPanel>

      <DataTable
        columns={columns}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        keyField="_id"
        emptyTitle="No shipments found"
        emptyDescription="Book your first shipment or adjust your filters."
      />
      {state.pagination && (
        <Pagination
          page={state.pagination.page}
          totalPages={state.pagination.totalPages}
          total={state.pagination.total}
          limit={state.pagination.limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel Shipment"
        danger
        loading={cancelling}
        message={
          <div>
            <p>Cancel shipment <strong>{cancelTarget?.awbNo}</strong>? This cannot be undone.</p>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Reason for cancellation"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
        }
        confirmLabel="Cancel Shipment"
        onConfirm={confirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
