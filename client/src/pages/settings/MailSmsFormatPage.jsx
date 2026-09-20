import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import FormSelect from '../../components/common/FormSelect';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { settingsService } from '../../services/generic.service';

const service = settingsService('mail-sms-format');
const TEMPLATE_KEYS = ['Booking Confirmation', 'Out for Delivery', 'Delivered', 'RTO Notice'];

export default function MailSmsFormatPage() {
  const [templateKey, setTemplateKey] = useState(TEMPLATE_KEYS[0]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await service.list({ search: templateKey });
        const record = (res.data || []).find((r) => r.templateKey === templateKey);
        setBody(record?.body || `Dear {{customerName}}, your shipment {{awbNo}} status: ${templateKey}.`);
      } catch {
        setBody(`Dear {{customerName}}, your shipment {{awbNo}} status: ${templateKey}.`);
      } finally {
        setLoading(false);
      }
    })();
  }, [templateKey]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await service.create({ templateKey, body });
      setMessage({ type: 'success', text: 'Template saved.' });
    } catch (err) {
      setMessage({ type: 'warning', text: `Backend endpoint not reachable yet (${err.message}). Draft kept locally.` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Mail / SMS Format" subtitle="Notification template editor" />
      <div className="card">
        <div className="card__body">
          <FormSelect label="Template" options={TEMPLATE_KEYS} value={templateKey} onChange={(e) => setTemplateKey(e.target.value)} placeholder={undefined} />
          {message && <div className={`alert alert-${message.type === 'success' ? 'success' : 'warning'}`} style={{ marginBottom: 'var(--space-4)' }}>{message.text}</div>}
          {loading ? (
            <LoadingSpinner label="Loading template…" />
          ) : (
            <div className="form-field">
              <label className="form-label">Body</label>
              <textarea className="form-control" rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
              <span className="form-hint">Supports placeholders like {'{{customerName}}'}, {'{{awbNo}}'}, {'{{status}}'}.</span>
            </div>
          )}
          <div className="form-actions">
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving || loading}><Save size={15} /> {saving ? 'Saving…' : 'Save Template'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
