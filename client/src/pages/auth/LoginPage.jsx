import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';
import FormInput from '../../components/common/FormInput';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import authService from '../../services/auth.service';

const schema = Joi.object({
  email: Joi.string().email({ tlds: false }).required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Enter a valid email address',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters',
  }),
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
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
    dispatch(loginStart());
    try {
      const res = await authService.login(values.email, values.password);
      dispatch(loginSuccess(res.data));
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      dispatch(loginFailure(err.message));
      setServerError(err.message || 'Login failed. Please check your credentials.');
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
        <h2 className="auth-card__title">Sign in to your account</h2>
        <p className="auth-card__subtitle">Courier &amp; shipment management console</p>

        {serverError && (
          <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormInput
            label="Email"
            type="email"
            placeholder="you@company.com"
            required
            error={errors.email?.message}
            {...register('email')}
          />
          <FormInput
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-4)' }}>
            <span />
            <Link to="/forgot-password" className="text-sm">Forgot password?</Link>
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
