import FormInput from '../common/FormInput';

/**
 * Shared address+tax-ID capture block reused for both Consignor and Consignee sections of
 * the shipment form (per CONTRACT.md Shipment.consignor / Shipment.consignee shapes), to
 * avoid duplicating ~20 near-identical fields twice.
 *
 * `prefix` is the RHF field prefix ("consignor" | "consignee"), `variant` toggles the small
 * set of fields that differ between the two (consignor has bank details, consignee has IOSS).
 */
export default function AddressFieldset({ title, prefix, register, errors = {}, variant }) {
  const err = errors[prefix] || {};
  const f = (name) => `${prefix}.${name}`;

  return (
    <div className="form-section">
      <h4 className="form-section__title">{title}</h4>
      <div className="form-grid">
        <FormInput label="Name" required error={err.name?.message} {...register(f('name'))} />
        <FormInput label="Contact Person" error={err.contactPerson?.message} {...register(f('contactPerson'))} />
      </div>
      <div className="form-grid">
        <FormInput label="Address Line 1" required error={err.address1?.message} {...register(f('address1'))} />
        <FormInput label="Address Line 2" error={err.address2?.message} {...register(f('address2'))} />
      </div>
      <div className="form-grid">
        <FormInput label="Address Line 3" error={err.address3?.message} {...register(f('address3'))} />
        <FormInput label="Pincode" required error={err.pincode?.message} {...register(f('pincode'))} />
      </div>
      <div className="form-grid-3">
        <FormInput label="City" required error={err.city?.message} {...register(f('city'))} />
        <FormInput label="State" error={err.state?.message} {...register(f('state'))} />
        <FormInput label="Country" required error={err.country?.message} {...register(f('country'))} />
      </div>
      <div className="form-grid">
        <FormInput label="Phone" required error={err.phone?.message} {...register(f('phone'))} />
        <FormInput label="Alternate Phone" error={err.phone2?.message} {...register(f('phone2'))} />
      </div>
      <div className="form-grid">
        <FormInput label="Email" type="email" error={err.email?.message} {...register(f('email'))} />
        <FormInput label="Aadhaar No" error={err.aadhaarNo?.message} {...register(f('aadhaarNo'))} />
      </div>
      <div className="form-grid-3">
        <FormInput label="PAN" error={err.pan?.message} {...register(f('pan'))} />
        <FormInput label="GSTIN" error={err.gstin?.message} {...register(f('gstin'))} />
        <FormInput label="IEC" error={err.iec?.message} {...register(f('iec'))} />
      </div>

      {variant === 'consignor' && (
        <div className="form-grid-3">
          <FormInput label="Bank AD Code" error={err.bankADCode?.message} {...register(f('bankADCode'))} />
          <FormInput label="Bank Account No" error={err.bankAC?.message} {...register(f('bankAC'))} />
          <FormInput label="Bank IFSC" error={err.bankIFSC?.message} {...register(f('bankIFSC'))} />
        </div>
      )}

      {variant === 'consignee' && (
        <div className="form-grid">
          <FormInput label="IOSS No" error={err.iossNo?.message} {...register(f('iossNo'))} />
          <FormInput label="IOSS Amount" type="number" step="0.01" error={err.iossAmount?.message} {...register(f('iossAmount'))} />
        </div>
      )}
    </div>
  );
}
