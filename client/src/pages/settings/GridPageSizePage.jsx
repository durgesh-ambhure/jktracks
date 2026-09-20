import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../../components/common/PageHeader';
import { selectPageSize, setPageSize } from '../../store/uiSlice';
import { PAGE_SIZE_OPTIONS } from '../../utils/constants';

export default function GridPageSizePage() {
  const pageSize = useSelector(selectPageSize);
  const dispatch = useDispatch();

  return (
    <div>
      <PageHeader title="Grid Page Size" subtitle="Default number of rows shown on list pages" />
      <div className="card" style={{ maxWidth: 420 }}>
        <div className="card__body">
          <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
            This applies immediately to every DataTable across the app (stored in your browser).
          </p>
          <div className="flex gap-2 flex-wrap">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                type="button"
                className={`btn ${pageSize === size ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => dispatch(setPageSize(size))}
              >
                {size} rows
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
