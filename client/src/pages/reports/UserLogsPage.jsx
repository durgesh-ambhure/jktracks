import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import FilterPanel from '../../components/common/FilterPanel';
import FormSelect from '../../components/common/FormSelect';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import reportService from '../../services/report.service';
import { usePagination } from '../../hooks/usePagination';
import { formatDateTime } from '../../utils/formatters';

const ACTION_OPTIONS = ['INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'CANCEL', 'EMAIL', 'COPY', 'OPEN'];

export default function UserLogsPage() {
  const [action, setAction] = useState('');
  const [applied, setApplied] = useState('');
  const { page, limit, setPage, setLimit } = usePagination();
  const [state, setState] = useState({ loading: true, error: '', rows: [], pagination: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const params = { page, limit };
      if (applied) params.action = applied;
      const res = await reportService.userLogs(params);
      setState({ loading: false, error: '', rows: res.data || [], pagination: res.pagination });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [], pagination: null });
    }
  }, [applied, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader title="User Logs" subtitle="Audit trail of user actions across the system" />
      <FilterPanel onApply={() => setApplied(action)} onClear={() => { setAction(''); setApplied(''); }}>
        <FormSelect label="Action" options={ACTION_OPTIONS} value={action} onChange={(e) => setAction(e.target.value)} />
      </FilterPanel>
      <DataTable
        columns={[
          { key: 'createdAt', header: 'Timestamp', render: (r) => formatDateTime(r.createdAt) },
          { key: 'user', header: 'User', render: (r) => r.userId?.name || r.userId || '-' },
          { key: 'action', header: 'Action' },
          { key: 'entity', header: 'Entity' },
          { key: 'formName', header: 'Form' },
          { key: 'actionDescription', header: 'Description' },
        ]}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        keyField="_id"
        emptyTitle="No audit log entries"
        emptyDescription="This report depends on GET /reports/user-logs, which may not be live on the backend yet."
      />
      {state.pagination && (
        <Pagination page={state.pagination.page} totalPages={state.pagination.totalPages} total={state.pagination.total} limit={state.pagination.limit} onPageChange={setPage} onLimitChange={setLimit} />
      )}
    </div>
  );
}
