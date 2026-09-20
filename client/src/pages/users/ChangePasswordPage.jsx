import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { KeyRound } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import authService from '../../services/auth.service';

const schema = Joi.object({
  currentPassword: Joi.string().required().messages({ 'string.empty': 'Current password is required' }),
  newPassword: Joi.string().min(6).required().messages({ 'string.empty': 'New password is required', 'string.min': 'Password must be at least 6 characters' }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({ 'any.only': 'Passwords do not match', 'string.empty': 'Please confirm your new password' }),
});

export default function ChangePasswordPage() {
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: joiResolver(schema) });

  const onSubmit = async (values) => {
    setSubmitting(true);
    setServerError('');
    setSuccess(false);
    try {
      await authService.changePassword(values.currentPassword, values.newPassword);
      setSuccess(true);
      reset();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Change Password" subtitle="Update your account password" />
      <div className="card" style={{ maxWidth: 480 }}>
        <div className="card__body">
          {success && <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>Password changed successfully.</div>}
          {serverError && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{serverError}</div>}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormInput label="Current Password" type="password" required error={errors.currentPassword?.message} {...register('currentPassword')} />
            <FormInput label="New Password" type="password" required error={errors.newPassword?.message} {...register('newPassword')} />
            <FormInput label="Confirm New Password" type="password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <KeyRound size={15} /> {submitting ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
