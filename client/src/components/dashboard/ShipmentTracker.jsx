import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

/**
 * "Track Your Shipment" widget. The AWB/Forwarding toggle is a UX hint for the user —
 * /tracking/:value on the backend resolves against the AWB number and both forwarding
 * numbers regardless, so either choice finds the shipment.
 */
export default function ShipmentTracker() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('AWB');
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!value.trim()) return;
    navigate(`/tracking/${encodeURIComponent(value.trim())}`);
  };

  return (
    <div className="card shipment-tracker">
      <div className="card__body">
        <div className="shipment-tracker__top">
          <h3 className="shipment-tracker__title">Track Your Shipment</h3>
          <div className="shipment-tracker__modes">
            <label className="shipment-tracker__radio">
              <input
                type="radio"
                name="tracker-mode"
                checked={mode === 'AWB'}
                onChange={() => setMode('AWB')}
              />
              AWB
            </label>
            <label className="shipment-tracker__radio">
              <input
                type="radio"
                name="tracker-mode"
                checked={mode === 'FORWARDING'}
                onChange={() => setMode('FORWARDING')}
              />
              Forwarding
            </label>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="shipment-tracker__form">
          <div className="search-input shipment-tracker__input">
            <Search size={16} />
            <input
              className="form-control"
              placeholder="AWB NO. / FORWARDING NO."
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (touched) setTouched(false);
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>
        {touched && !value.trim() && (
          <p className="shipment-tracker__error">Enter an AWB or forwarding number to search.</p>
        )}
      </div>
    </div>
  );
}
