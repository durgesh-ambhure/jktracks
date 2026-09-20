import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { Link } from 'react-router-dom';
import { Truck, MailCheck } from 'lucide-react';
import FormInput from '../../components/common/FormInput';
import authService from '../../services/auth.service';

const schema = Joi.object({
  email: Joi.string().email({ tlds: false }).required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Enter a valid email address',
  }),
});

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: joiResolver(schema) });

  const onSubmit = async (values) => {
    setServerError('');
    setSubmitting(true);
    try {
      await authService.forgotPassword(values.email);
      setSent(true);
    } catch (err) {
      setServerError(err.message || 'Could not send reset link.');
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
        <h2 className="auth-card__title">Forgot password</h2>
        <p className="auth-card__subtitle">We&apos;ll email you a link to reset it.</p>

        {sent ? (
          <div className="alert alert-success flex items-center gap-2">
            <MailCheck size={16} /> If that email exists, a reset link has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {serverError && (
              <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>
                {serverError}
              </div>
            )}
            <FormInput
              label="Email"
              type="email"
              placeholder="you@company.com"
              required
              error={errors.email?.message}
              {...register('email')}
            />
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send Reset Link'}
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
