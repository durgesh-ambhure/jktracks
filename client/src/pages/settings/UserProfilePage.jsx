import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import { selectCurrentUser, updateUser } from '../../store/authSlice';
import userService from '../../services/user.service';
import { initials } from '../../utils/formatters';

export default function UserProfilePage() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const { register, handleSubmit } = useForm({ defaultValues: { name: user?.name || '', email: user?.email || '' } });

  const onSubmit = async (values) => {
    setSubmitting(true);
    setMessage(null);
    try {
      await userService.update(user.id, { name: values.name });
      dispatch(updateUser({ name: values.name }));
      setMessage({ type: 'success', text: 'Profile updated.' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Your Profile" subtitle="Personal account details" />
      <div className="card" style={{ maxWidth: 480 }}>
        <div className="card__body">
          <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-5)' }}>
            <div className="user-menu__avatar" style={{ width: 56, height: 56, fontSize: 18 }}>{initials(user?.name) || 'U'}</div>
            <div>
              <p className="fw-semibold" style={{ marginBottom: 2 }}>{user?.name}</p>
              <p className="text-sm text-muted">{user?.userCode} · {user?.role}</p>
            </div>
          </div>
          {message && <div className={`alert alert-${message.type}`} style={{ marginBottom: 'var(--space-4)' }}>{message.text}</div>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormInput label="Name" required {...register('name')} />
            <FormInput label="Email" type="email" disabled hint="Email cannot be changed here." {...register('email')} />
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}><Save size={15} /> {submitting ? 'Saving…' : 'Save Profile'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
