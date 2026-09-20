import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Truck } from 'lucide-react';
import FormInput from '../../components/common/FormInput';
import authService from '../../services/auth.service';

const schema = Joi.object({
  newPassword: Joi.string().min(6).required().messages({
    'string.empty': 'New password is required',
    'string.min': 'Password must be at least 6 characters',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
    'string.empty': 'Please confirm your new password',
  }),
});

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: joiResolver(schema) });

  const onSubmit = async (values) => {
    setServerError('');
    setSubmitting(true);
    try {
      await authService.resetPassword(token, values.newPassword);
      setDone(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setServerError(err.message || 'Could not reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-card__brand">
          <Truck size={22} />
          JK Tracks
        </div>
        <h2 className="auth-card__title">Reset password</h2>
        <p className="auth-card__subtitle">Choose a new password for your account.</p>

        {!token && (
          <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>
            No reset token found in the URL. Use the link from your email.
          </div>
        )}

        {done ? (
          <div className="alert alert-success">Password reset. Redirecting to sign in…</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {serverError && (
              <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>
                {serverError}
              </div>
            )}
            <FormInput
              label="New Password"
              type="password"
              required
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <FormInput
              label="Confirm New Password"
              type="password"
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
              {submitting ? 'Saving…' : 'Reset Password'}
            </button>
          </form>
        )}
        <p className="text-sm text-center" style={{ marginTop: 'var(--space-5)' }}>
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
