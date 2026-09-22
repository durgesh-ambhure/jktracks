import { useState } from 'react';
import FormInput from '../common/FormInput';
import FormSelect from '../common/FormSelect';
import { KYC_TYPE_OPTIONS } from '../../utils/constants';
import { mastersService } from '../../services/generic.service';

const pincodeMaster = mastersService('pincodes');

/**
 * Shared address+tax-ID capture block reused for both Consignor and Consignee sections of
 * the shipment form (per CONTRACT.md Shipment.consignor / Shipment.consignee shapes), to
 * avoid duplicating ~20 near-identical fields twice.
 *
 * `prefix` is the RHF field prefix ("consignor" | "consignee"), `variant` toggles the small
 * set of fields that differ between the two (consignor has bank details, consignee has IOSS).
 */
export default function AddressFieldset({ title, prefix, register, errors = {}, variant, watch, setValue }) {
  const err = errors[prefix] || {};
  const f = (name) => `${prefix}.${name}`;
  const [pinLookup, setPinLookup] = useState({ loading: false, message: '' });

  const handlePincodeSearch = async () => {
    const pincode = (watch?.(f('pincode')) || '').trim();
    if (!pincode) {
      setPinLookup({ loading: false, message: 'Enter a pincode to search.' });
      return;
    }
    setPinLookup({ loading: true, message: '' });
    try {
      const res = await pincodeMaster.list({ limit: 500 });
      const match = (res.data || []).find((r) => r.data?.pincode === pincode);
      if (match) {
        if (match.data.city) setValue?.(f('city'), match.data.city);
        if (match.data.state) setValue?.(f('state'), match.data.state);
        setPinLookup({ loading: false, message: `Matched: ${match.data.city || ''} ${match.data.state ? `, ${match.data.state}` : ''}` });
      } else {
        setPinLookup({ loading: false, message: 'No match found in PinCode Master — enter city/state manually.' });
      }
    } catch (err2) {
      setPinLookup({ loading: false, message: err2.message || 'Lookup failed.' });
    }
  };

  const handleFileChange = (fieldName) => (e) => {
    setValue?.(fieldName, e.target.files?.[0]?.name || '');
  };

  return (
    <div className="form-section">
      <h4 className="form-section__title">{title}</h4>
      <FormInput label="Name" required error={err.name?.message} {...register(f('name'))} />
      <FormInput label="Contact Person" error={err.contactPerson?.message} {...register(f('contactPerson'))} />
      <FormInput label="Address Line 1" required error={err.address1?.message} {...register(f('address1'))} />
      <FormInput label="Address Line 2" error={err.address2?.message} {...register(f('address2'))} />
      <FormInput label="Address Line 3" error={err.address3?.message} {...register(f('address3'))} />
      <div className="form-field">
        <label className="form-label">Pincode<span className="required">*</span></label>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flex: 1, minWidth: 0 }}>
          <input className={`form-control ${err.pincode ? 'has-error' : ''}`} {...register(f('pincode'))} />
          <button type="button" className="btn btn-secondary btn-sm" onClick={handlePincodeSearch} disabled={pinLookup.loading} style={{ flexShrink: 0 }}>
            {pinLookup.loading ? '…' : 'Search'}
          </button>
        </div>
        {err.pincode?.message ? (
          <span className="form-error">{err.pincode.message}</span>
        ) : (
          pinLookup.message && <span className="form-hint">{pinLookup.message}</span>
        )}
      </div>
      <FormInput label="City" required error={err.city?.message} {...register(f('city'))} />
      <FormInput label="State" error={err.state?.message} {...register(f('state'))} />
      <FormInput label="Country" required error={err.country?.message} {...register(f('country'))} />
      <FormInput label="Phone" required error={err.phone?.message} {...register(f('phone'))} />
      <FormInput label="Alternate Phone" error={err.phone2?.message} {...register(f('phone2'))} />
      <FormInput label="Email" type="email" error={err.email?.message} {...register(f('email'))} />
      <FormInput label="Aadhaar No" error={err.aadhaarNo?.message} {...register(f('aadhaarNo'))} />
      <FormInput label="PAN" error={err.pan?.message} {...register(f('pan'))} />
      <FormInput label="GSTIN" error={err.gstin?.message} {...register(f('gstin'))} />
      <FormInput label="IEC" error={err.iec?.message} {...register(f('iec'))} />

      <FormSelect label="KYC Type" options={KYC_TYPE_OPTIONS} error={err.kycType?.message} {...register(f('kycType'))} />
      <FormInput label="KYC Number" error={err.kycNumber?.message} {...register(f('kycNumber'))} />
      <div className="form-field">
        <label className="form-label">Upload KYC (front)</label>
        <input className="form-control" type="file" onChange={handleFileChange(f('kycDocument1'))} />
        <span className="form-hint">{watch?.(f('kycDocument1')) || 'No file chosen'}</span>
      </div>
      <div className="form-field">
        <label className="form-label">Upload KYC (back)</label>
        <input className="form-control" type="file" onChange={handleFileChange(f('kycDocument2'))} />
        <span className="form-hint">{watch?.(f('kycDocument2')) || 'No file chosen'}</span>
      </div>

      {variant === 'consignor' && (
        <>
          <FormInput label="Bank AD Code" error={err.bankADCode?.message} {...register(f('bankADCode'))} />
          <FormInput label="Bank Account No" error={err.bankAC?.message} {...register(f('bankAC'))} />
          <FormInput label="Bank IFSC" error={err.bankIFSC?.message} {...register(f('bankIFSC'))} />
        </>
      )}

      {variant === 'consignee' && (
        <>
          <FormInput label="IOSS No" error={err.iossNo?.message} {...register(f('iossNo'))} />
          <FormInput label="IOSS Amount" type="number" step="0.01" error={err.iossAmount?.message} {...register(f('iossAmount'))} />
        </>
      )}
    </div>
  );
}
