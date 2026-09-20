import { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, XCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { importFile } from '../../services/generic.service';

/**
 * Generic Tier-2 upload screen reused for all 9 Excel Import routes. Uploads to
 * /api/v1/imports/:key and shows a "processed" results table. Full server-side parse/
 * validate/preview/commit workflow is a documented TODO per FEATURES.md.
 */
export default function ImportGenericPage({ importKey, title }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFiles = (files) => {
    if (files?.[0]) {
      setFile(files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setProgress(0);
    try {
      const res = await importFile(importKey, file, setProgress);
      setResult(res.data || { rows: [], message: res.message });
    } catch (err) {
      setError(err.message || 'Upload failed. The import endpoint may not be reachable yet.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <PageHeader title={title} subtitle="Upload an .xlsx/.csv file — server-side parse, validate and commit" />

      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card__body">
          <div
            className={`file-drop ${dragOver ? 'drag-over' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          >
            <UploadCloud size={30} style={{ marginBottom: 8 }} />
            <p className="fw-medium">Drag & drop your file here, or click to browse</p>
            <p className="text-xs text-muted">Accepted: .xlsx, .xls, .csv</p>
            <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={(e) => handleFiles(e.target.files)} />
          </div>

          {file && (
            <div className="flex items-center justify-between" style={{ marginTop: 'var(--space-4)' }}>
              <span className="flex items-center gap-2 text-sm"><FileSpreadsheet size={16} /> {file.name}</span>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleUpload} disabled={uploading}>
                {uploading ? `Uploading… ${progress}%` : 'Upload & Process'}
              </button>
            </div>
          )}

          {error && <div className="alert alert-danger" style={{ marginTop: 'var(--space-4)' }}>{error}</div>}
        </div>
      </div>

      <div className="card">
        <div className="card__header"><h3 className="card__title">Processing Result</h3></div>
        <div className="card__body">
          {!result && (
            <EmptyState
              title="No file processed yet"
              description="Upload a file above to see processed rows and validation errors here."
            />
          )}
          {result && (
            <div>
              {result.message && <div className="alert alert-info" style={{ marginBottom: 'var(--space-4)' }}>{result.message}</div>}
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr><th>Row</th><th>Status</th><th>Details</th></tr>
                  </thead>
                  <tbody>
                    {(result.rows || []).length === 0 ? (
                      <tr><td colSpan={3} className="text-sm text-muted">No row-level detail returned by the server yet.</td></tr>
                    ) : (
                      result.rows.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.rowNumber || idx + 1}</td>
                          <td>
                            {row.success ? (
                              <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-success-500)' }}><CheckCircle2 size={14} /> Processed</span>
                            ) : (
                              <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-danger-500)' }}><XCircle size={14} /> Failed</span>
                            )}
                          </td>
                          <td>{row.message || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
