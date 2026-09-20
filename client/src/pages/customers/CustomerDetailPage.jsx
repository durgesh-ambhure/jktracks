import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import { usePermission } from '../../hooks/usePermission';
import customerService from '../../services/customer.service';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canUpdate = usePermission('customers.update');
  const [state, setState] = useState({ loading: true, error: '', data: null });

  const load = useCallback(async () => {
    setState({ loading: true, error: '', data: null });
    try {
      const res = await customerService.get(id);
      setState({ loading: false, error: '', data: res.data });
    } catch (err) {
      setState({ loading: false, error: err.message, data: null });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (state.loading) return <LoadingSpinner label="Loading client…" full />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  const c = state.data;

  return (
    <div>
      <PageHeader
        title={c.name}
        breadcrumb={[{ label: 'Clients', to: '/customers' }, { label: c.name }]}
        subtitle={<StatusBadge status={c.status} />}
        actions={canUpdate && <button type="button" className="btn btn-secondary" onClick={() => navigate(`/customers/${id}/edit`)}><Pencil size={15} /> Edit</button>}
      />
      <div className="grid-2">
        <div className="card">
          <div className="card__header"><h3 className="card__title">Details</h3></div>
          <div className="card__body text-sm">
            <div className="grid-2">
              <div><span className="text-muted">Client Code: </span>{c.clientCode}</div>
              <div><span className="text-muted">Contact Person: </span>{c.contactPerson || '-'}</div>
              <div><span className="text-muted">Email: </span>{c.email || '-'}</div>
              <div><span className="text-muted">Phone: </span>{c.phone || '-'}</div>
              <div><span className="text-muted">Credit Limit: </span>{formatCurrency(c.creditLimit)}</div>
              <div><span className="text-muted">Created: </span>{formatDate(c.createdAt)}</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card__header"><h3 className="card__title">Address &amp; Tax</h3></div>
          <div className="card__body text-sm">
            <p>{[c.address1, c.address2].filter(Boolean).join(', ') || '-'}</p>
            <p style={{ marginBottom: 12 }}>{[c.city, c.state, c.pincode, c.country].filter(Boolean).join(', ')}</p>
            <div className="grid-2">
              <div><span className="text-muted">GSTIN: </span>{c.gstin || '-'}</div>
              <div><span className="text-muted">PAN: </span>{c.pan || '-'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
