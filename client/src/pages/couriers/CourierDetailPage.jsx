import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, KeyRound } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import { usePermission } from '../../hooks/usePermission';
import courierService from '../../services/courier.service';
import { formatDate } from '../../utils/formatters';

export default function CourierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canUpdate = usePermission('couriers.update');
  const [state, setState] = useState({ loading: true, error: '', data: null });

  const load = useCallback(async () => {
    setState({ loading: true, error: '', data: null });
    try {
      const res = await courierService.get(id);
      setState({ loading: false, error: '', data: res.data });
    } catch (err) {
      setState({ loading: false, error: err.message, data: null });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (state.loading) return <LoadingSpinner label="Loading vendor…" full />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  const v = state.data;

  return (
    <div>
      <PageHeader
        title={v.name}
        breadcrumb={[{ label: 'Vendors', to: '/couriers' }, { label: v.name }]}
        subtitle={<StatusBadge status={v.status} />}
        actions={canUpdate && <button type="button" className="btn btn-secondary" onClick={() => navigate(`/couriers/${id}/edit`)}><Pencil size={15} /> Edit</button>}
      />
      <div className="grid-2">
        <div className="card">
          <div className="card__header"><h3 className="card__title">Details</h3></div>
          <div className="card__body text-sm">
            <div className="grid-2">
              <div><span className="text-muted">Vendor Code: </span>{v.vendorCode}</div>
              <div><span className="text-muted">API URL: </span>{v.apiUrl || '-'}</div>
              <div><span className="text-muted">API Key: </span><span className="flex items-center gap-1">{v.hasApiKey === false ? 'Not configured' : <><KeyRound size={13} /> Configured</>}</span></div>
              <div><span className="text-muted">Tracking API: </span>{v.trackingEnabled ? 'Enabled' : 'Disabled'}</div>
              <div><span className="text-muted">Created: </span>{formatDate(v.createdAt)}</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card__header"><h3 className="card__title">Service Types</h3></div>
          <div className="card__body">
            {v.serviceTypes?.length ? (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {v.serviceTypes.map((s, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span>{s.name}</span>
                    <span className="badge badge-gray">{s.code}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No service types configured.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
