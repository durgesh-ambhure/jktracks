import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { Save, X } from 'lucide-react';
import FormInput from '../common/FormInput';
import FormSelect from '../common/FormSelect';

const schema = Joi.object({
  clientCode: Joi.string().required().messages({ 'string.empty': 'Client code is required' }),
  name: Joi.string().required().messages({ 'string.empty': 'Name is required' }),
  contactPerson: Joi.string().allow(''),
  email: Joi.string().allow('').email({ tlds: false }).messages({ 'string.email': 'Enter a valid email' }),
  phone: Joi.string().allow(''),
  address1: Joi.string().allow(''),
  address2: Joi.string().allow(''),
  city: Joi.string().allow(''),
  state: Joi.string().allow(''),
  country: Joi.string().allow(''),
  pincode: Joi.string().allow(''),
  gstin: Joi.string().allow(''),
  pan: Joi.string().allow(''),
  creditLimit: Joi.alternatives().try(Joi.number().min(0), Joi.string().allow('')),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').required(),
});

const defaults = {
  clientCode: '', name: '', contactPerson: '', email: '', phone: '', address1: '', address2: '',
  city: '', state: '', country: 'India', pincode: '', gstin: '', pan: '', creditLimit: '', status: 'ACTIVE',
};

export default function CustomerForm({ defaultValues, onSubmit, submitting, submitLabel = 'Save Client', onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: joiResolver(schema), defaultValues: defaultValues || defaults });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-grid-3">
        <FormInput label="Client Code" required error={errors.clientCode?.message} {...register('clientCode')} />
        <FormInput label="Name" required error={errors.name?.message} {...register('name')} />
        <FormInput label="Contact Person" error={errors.contactPerson?.message} {...register('contactPerson')} />
      </div>
      <div className="form-grid-3">
        <FormInput label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <FormInput label="Phone" error={errors.phone?.message} {...register('phone')} />
        <FormSelect label="Status" required options={['ACTIVE', 'INACTIVE']} error={errors.status?.message} {...register('status')} />
      </div>
      <div className="form-grid">
        <FormInput label="Address Line 1" error={errors.address1?.message} {...register('address1')} />
        <FormInput label="Address Line 2" error={errors.address2?.message} {...register('address2')} />
      </div>
      <div className="form-grid-3">
        <FormInput label="City" error={errors.city?.message} {...register('city')} />
        <FormInput label="State" error={errors.state?.message} {...register('state')} />
        <FormInput label="Pincode" error={errors.pincode?.message} {...register('pincode')} />
      </div>
      <div className="form-grid-3">
        <FormInput label="Country" error={errors.country?.message} {...register('country')} />
        <FormInput label="GSTIN" error={errors.gstin?.message} {...register('gstin')} />
        <FormInput label="PAN" error={errors.pan?.message} {...register('pan')} />
      </div>
      <FormInput label="Credit Limit" type="number" step="0.01" error={errors.creditLimit?.message} {...register('creditLimit')} />

      <div className="form-actions">
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}><X size={15} /> Cancel</button>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          <Save size={15} /> {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
