import { useFieldArray, useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import FormInput from '../common/FormInput';
import FormSelect from '../common/FormSelect';

const schema = Joi.object({
  vendorCode: Joi.string().required().messages({ 'string.empty': 'Vendor code is required' }),
  name: Joi.string().required().messages({ 'string.empty': 'Name is required' }),
  apiUrl: Joi.string().allow(''),
  apiKey: Joi.string().allow(''),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').required(),
  trackingEnabled: Joi.boolean().default(false),
  serviceTypes: Joi.array().items(Joi.object({ name: Joi.string().allow(''), code: Joi.string().allow('') })).default([]),
});

const defaults = { vendorCode: '', name: '', apiUrl: '', apiKey: '', status: 'ACTIVE', trackingEnabled: false, serviceTypes: [] };

export default function CourierForm({ defaultValues, onSubmit, submitting, submitLabel = 'Save Vendor', onCancel, isEdit, hasApiKey }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ resolver: joiResolver(schema), defaultValues: defaultValues || defaults });
  const { fields, append, remove } = useFieldArray({ control, name: 'serviceTypes' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-grid-3">
        <FormInput label="Vendor Code" required error={errors.vendorCode?.message} {...register('vendorCode')} />
        <FormInput label="Name" required error={errors.name?.message} {...register('name')} />
        <FormSelect label="Status" required options={['ACTIVE', 'INACTIVE']} error={errors.status?.message} {...register('status')} />
      </div>
      <div className="form-grid">
        <FormInput label="API URL" error={errors.apiUrl?.message} {...register('apiUrl')} />
        <FormInput
          label="API Key"
          type="password"
          placeholder={isEdit && hasApiKey ? '•••••••• (configured — leave blank to keep)' : 'Enter API key'}
          hint={isEdit ? (hasApiKey ? 'Configured. Server never returns the stored key; enter a new one to replace it.' : 'Not configured.') : undefined}
          error={errors.apiKey?.message}
          {...register('apiKey')}
        />
      </div>
      <label className="checkbox-row" style={{ marginBottom: 'var(--space-4)' }}>
        <input type="checkbox" {...register('trackingEnabled')} /> Tracking API enabled for this vendor
      </label>

      <div className="form-section">
        <h4 className="form-section__title">Service Types</h4>
        {fields.map((field, index) => (
          <div className="form-grid" key={field.id} style={{ alignItems: 'end' }}>
            <FormInput label="Service Name" {...register(`serviceTypes.${index}.name`)} />
            <div className="flex gap-2 items-end">
              <FormInput label="Code" containerClassName="flex-1" {...register(`serviceTypes.${index}.code`)} />
              <button type="button" className="btn btn-ghost btn-sm btn-icon-only" style={{ marginBottom: 16 }} onClick={() => remove(index)}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => append({ name: '', code: '' })}>
          <Plus size={14} /> Add Service Type
        </button>
      </div>

      <div className="form-actions">
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}><X size={15} /> Cancel</button>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          <Save size={15} /> {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
