import { forwardRef } from 'react';

const FormDatePicker = forwardRef(function FormDatePicker(
  { label, error, required, hint, className = '', containerClassName = '', type = 'date', ...rest },
  ref
) {
  return (
    <div className={`form-field ${containerClassName}`}>
      {label && (
        <label className="form-label" htmlFor={rest.id || rest.name}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={rest.id || rest.name}
        className={`form-control ${error ? 'has-error' : ''} ${className}`}
        {...rest}
      />
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

export default FormDatePicker;
