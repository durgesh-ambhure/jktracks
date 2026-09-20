import { forwardRef } from 'react';

const FormSelect = forwardRef(function FormSelect(
  { label, error, required, hint, options = [], placeholder = 'Select…', className = '', containerClassName = '', ...rest },
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
      <select
        ref={ref}
        id={rest.id || rest.name}
        className={`form-control ${error ? 'has-error' : ''} ${className}`}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) =>
          typeof opt === 'string' ? (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ) : (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )
        )}
      </select>
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

export default FormSelect;
