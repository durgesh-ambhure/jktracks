import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { Save, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import FormDatePicker from '../../components/common/FormDatePicker';
import { manifestsService } from '../../services/generic.service';
import { toInputDate } from '../../utils/formatters';

const schema = Joi.object({
  manifestNo: Joi.string().allow(''),
  manifestDate: Joi.string().required().messages({ 'string.empty': 'Manifest date is required' }),
  originHub: Joi.string().required().messages({ 'string.empty': 'Origin hub is required' }),
  destHub: Joi.string().allow(''),
  numberOfBags: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
  weight: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
  productCode: Joi.string().allow(''),
});

const defaults = {
  manifestNo: '', manifestDate: toInputDate(new Date()), originHub: '', destHub: '',
  numberOfBags: '', weight: '', productCode: '',
};

export default function TransferManifestCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: joiResolver(schema),
    defaultValues: defaults,
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    setError('');
    try {
      await manifestsService.create({ ...values, label: values.manifestNo || undefined });
      navigate('/manifests');
    } catch (err) {
      setError(err.message || 'Could not create transfer manifest.');
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="New Transfer Manifest"
        breadcrumb={[{ label: 'Manifest' }, { label: 'All Transfer Manifests', to: '/manifests' }, { label: 'New Transfer Manifest' }]}
      />
      {error && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}
      <div className="card">
        <div className="card__body">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-grid-4">
              <FormInput label="Manifest No" hint="Leave blank to auto-generate" error={errors.manifestNo?.message} {...register('manifestNo')} />
              <FormDatePicker label="Manifest Date" required error={errors.manifestDate?.message} {...register('manifestDate')} />
              <FormInput label="Origin Hub Code" required error={errors.originHub?.message} {...register('originHub')} />
              <FormInput label="Destination Hub Code" error={errors.destHub?.message} {...register('destHub')} />
            </div>
            <div className="form-grid-4">
              <FormInput label="Number of Bags" type="number" error={errors.numberOfBags?.message} {...register('numberOfBags')} />
              <FormInput label="Weight" type="number" step="0.01" error={errors.weight?.message} {...register('weight')} />
              <FormInput label="Product Code" error={errors.productCode?.message} {...register('productCode')} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/manifests')}>
                <X size={15} /> Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <Save size={15} /> {submitting ? 'Saving…' : 'Create Transfer Manifest'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
