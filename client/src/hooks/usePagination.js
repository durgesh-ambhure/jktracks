import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectPageSize } from '../store/uiSlice';

export function usePagination(initialLimit) {
  const defaultLimit = useSelector(selectPageSize);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit || defaultLimit || 20);

  const goToPage = useCallback((p) => setPage(Math.max(1, p)), []);
  const changeLimit = useCallback((l) => {
    setLimit(l);
    setPage(1);
  }, []);
  const reset = useCallback(() => setPage(1), []);

  return { page, limit, setPage: goToPage, setLimit: changeLimit, reset };
}

export default usePagination;
