import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { Save, X } from 'lucide-react';
import FormInput from '../common/FormInput';
import FormSelect from '../common/FormSelect';
import userService from '../../services/user.service';

function buildSchema(isEdit) {
  return Joi.object({
    userCode: Joi.string().required().messages({ 'string.empty': 'User code is required' }),
    name: Joi.string().required().messages({ 'string.empty': 'Name is required' }),
    email: Joi.string().email({ tlds: false }).required().messages({ 'string.empty': 'Email is required', 'string.email': 'Enter a valid email' }),
    password: isEdit
      ? Joi.string().allow('').min(6).messages({ 'string.min': 'Password must be at least 6 characters' })
      : Joi.string().min(6).required().messages({ 'string.empty': 'Password is required', 'string.min': 'Password must be at least 6 characters' }),
    role: Joi.string().required().messages({ 'string.empty': 'Select a role' }),
    companyCode: Joi.string().allow(''),
    isActive: Joi.boolean().default(true),
  });
}

const defaults = { userCode: '', name: '', email: '', password: '', role: 'STAFF', companyCode: '', isActive: true };

export default function UserForm({ defaultValues, onSubmit, submitting, submitLabel = 'Save User', onCancel, isEdit = false }) {
  const [roleOptions, setRoleOptions] = useState([]);

  useEffect(() => {
    // Roles are no longer a fixed 5-value set — Group Rights/User Group can add custom
    // groups, so this list is fetched from the Role collection instead of a static constant.
    userService.roles().then((res) => setRoleOptions((res.data || []).map((r) => r.name))).catch(() => setRoleOptions([]));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: joiResolver(buildSchema(isEdit)), defaultValues: defaultValues || defaults });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-grid-3">
        <FormInput label="User Code" required error={errors.userCode?.message} {...register('userCode')} />
        <FormInput label="Name" required error={errors.name?.message} {...register('name')} />
        <FormInput label="Email" type="email" required error={errors.email?.message} {...register('email')} />
      </div>
      <div className="form-grid-3">
        <FormInput
          label={isEdit ? 'New Password' : 'Password'}
          type="password"
          required={!isEdit}
          hint={isEdit ? 'Leave blank to keep current password' : undefined}
          error={errors.password?.message}
          {...register('password')}
        />
        <FormSelect label="Role" required options={roleOptions} error={errors.role?.message} {...register('role')} />
        <FormInput label="Company Code" error={errors.companyCode?.message} {...register('companyCode')} />
      </div>
      <label className="checkbox-row" style={{ marginBottom: 'var(--space-4)' }}>
        <input type="checkbox" {...register('isActive')} /> Active
      </label>

      <div className="form-actions">
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}><X size={15} /> Cancel</button>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          <Save size={15} /> {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
