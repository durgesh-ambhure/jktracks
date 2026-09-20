import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { Save, X } from 'lucide-react';
import AddressFieldset from './AddressFieldset';
import WeightBoxesFieldArray from './WeightBoxesFieldArray';
import FormInput from '../common/FormInput';
import FormSelect from '../common/FormSelect';
import FormDatePicker from '../common/FormDatePicker';
import customerService from '../../services/customer.service';
import courierService from '../../services/courier.service';
import {
  BUSINESS_TYPE_OPTIONS,
  PACKET_TYPE_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
  WEIGHT_UNIT_OPTIONS,
  INCOTERMS_OPTIONS,
  BILL_TO_OPTIONS,
  CURRENCY_OPTIONS,
} from '../../utils/constants';
import { formatCurrency, toInputDate } from '../../utils/formatters';

const addressSchema = Joi.object({
  name: Joi.string().required().messages({ 'string.empty': 'Name is required' }),
  contactPerson: Joi.string().allow(''),
  address1: Joi.string().required().messages({ 'string.empty': 'Address line 1 is required' }),
  address2: Joi.string().allow(''),
  address3: Joi.string().allow(''),
  pincode: Joi.string().required().messages({ 'string.empty': 'Pincode is required' }),
  country: Joi.string().required().messages({ 'string.empty': 'Country is required' }),
  state: Joi.string().allow(''),
  city: Joi.string().required().messages({ 'string.empty': 'City is required' }),
  phone: Joi.string().required().messages({ 'string.empty': 'Phone is required' }),
  phone2: Joi.string().allow(''),
  email: Joi.string().allow('').email({ tlds: false }).messages({ 'string.email': 'Enter a valid email' }),
  pan: Joi.string().allow(''),
  gstin: Joi.string().allow(''),
  iec: Joi.string().allow(''),
  aadhaarNo: Joi.string().allow(''),
  bankADCode: Joi.string().allow(''),
  bankAC: Joi.string().allow(''),
  bankIFSC: Joi.string().allow(''),
  iossNo: Joi.string().allow(''),
  iossAmount: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
});

const schema = Joi.object({
  awbNo: Joi.string().required().messages({ 'string.empty': 'AWB No is required' }),
  refNo: Joi.string().allow(''),
  bookingDate: Joi.string().required().messages({ 'string.empty': 'Booking date is required' }),
  clientId: Joi.string().required().messages({ 'string.empty': 'Client is required' }),
  businessType: Joi.string().valid(...BUSINESS_TYPE_OPTIONS).required().messages({ 'any.only': 'Select a business type', 'string.empty': 'Select a business type' }),
  consignor: addressSchema,
  consignee: addressSchema,
  packetType: Joi.string().valid(...PACKET_TYPE_OPTIONS).required().messages({ 'any.only': 'Select a packet type', 'string.empty': 'Select a packet type' }),
  paymentType: Joi.string().valid(...PAYMENT_TYPE_OPTIONS).required().messages({ 'any.only': 'Select a payment type', 'string.empty': 'Select a payment type' }),
  amount: Joi.number().min(0).required().messages({ 'number.base': 'Amount is required' }),
  currency: Joi.string().required().messages({ 'string.empty': 'Currency is required' }),
  invoiceNo: Joi.string().allow(''),
  packetDescription: Joi.string().allow(''),
  invoiceDescription: Joi.string().allow(''),
  weightDetails: Joi.object({
    pieces: Joi.number().min(1).required().messages({ 'number.base': 'Pieces is required' }),
    actualWeight: Joi.number().min(0).required().messages({ 'number.base': 'Actual weight is required' }),
    vendorWeight: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
    weightUnit: Joi.string().valid(...WEIGHT_UNIT_OPTIONS).required(),
    totalValue: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
    valueCurrency: Joi.string().allow(''),
    divisor: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
    isVolumetric: Joi.boolean().default(false),
    boxes: Joi.array().items(Joi.object().unknown(true)).default([]),
  }),
  forwarding: Joi.object({
    vendorId: Joi.string().required().messages({ 'string.empty': 'Vendor is required' }),
    serviceType: Joi.string().allow(''),
    packaging: Joi.string().allow(''),
    forwardingNo1: Joi.string().allow(''),
    forwardingNo2: Joi.string().allow(''),
    vendorAccountNo: Joi.string().allow(''),
    dutiesAccountNo: Joi.string().allow(''),
    billDutiesTo: Joi.string().valid(...BILL_TO_OPTIONS).allow(''),
    billShipmentTo: Joi.string().valid(...BILL_TO_OPTIONS).allow(''),
    pickupPoint: Joi.string().allow(''),
    incoterms: Joi.string().valid(...INCOTERMS_OPTIONS).allow(''),
    shipmentPurpose: Joi.string().allow(''),
  }),
  clientCharges: Joi.object({
    freight: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
    otherCharges: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
    fuel: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
    gst: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
  }),
  vendorCharges: Joi.object({
    freight: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
    otherCharges: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
    fuel: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
    gst: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
  }),
  operationRemarks: Joi.string().allow(''),
  accountingRemarks: Joi.string().allow(''),
});

const emptyAddress = {
  name: '', contactPerson: '', address1: '', address2: '', address3: '', pincode: '',
  country: 'India', state: '', city: '', phone: '', phone2: '', email: '', pan: '', gstin: '',
  iec: '', aadhaarNo: '', bankADCode: '', bankAC: '', bankIFSC: '', iossNo: '', iossAmount: '',
};

const defaultShipment = {
  awbNo: '', refNo: '', bookingDate: toInputDate(new Date()), clientId: '', businessType: 'B2C',
  consignor: emptyAddress, consignee: { ...emptyAddress },
  packetType: 'DOX', paymentType: 'CASH', amount: '', currency: 'INR',
  invoiceNo: '', packetDescription: '', invoiceDescription: '',
  weightDetails: { pieces: 1, actualWeight: '', vendorWeight: '', weightUnit: 'KGS', totalValue: '', valueCurrency: 'INR', divisor: 5000, isVolumetric: false, boxes: [] },
  forwarding: { vendorId: '', serviceType: '', packaging: '', forwardingNo1: '', forwardingNo2: '', vendorAccountNo: '', dutiesAccountNo: '', billDutiesTo: 'SENDER', billShipmentTo: 'SENDER', pickupPoint: '', incoterms: 'DDU', shipmentPurpose: '' },
  clientCharges: { freight: '', otherCharges: '', fuel: '', gst: '' },
  vendorCharges: { freight: '', otherCharges: '', fuel: '', gst: '' },
  operationRemarks: '', accountingRemarks: '',
};

export default function ShipmentForm({ defaultValues, onSubmit, submitting, submitLabel = 'Save Shipment', onCancel }) {
  const [clients, setClients] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [lookupError, setLookupError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(schema),
    defaultValues: defaultValues || defaultShipment,
  });

  useEffect(() => {
    (async () => {
      try {
        const [c, v] = await Promise.all([
          customerService.list({ limit: 100 }),
          courierService.list({ limit: 100 }),
        ]);
        setClients(c.data || []);
        setVendors(v.data || []);
      } catch (err) {
        setLookupError(err.message);
      }
    })();
  }, []);

  const clientOptions = useMemo(
    () => clients.map((c) => ({ value: c._id, label: `${c.clientCode} — ${c.name}` })),
    [clients]
  );
  const vendorOptions = useMemo(
    () => vendors.map((v) => ({ value: v._id, label: `${v.vendorCode} — ${v.name}` })),
    [vendors]
  );

  const [cf, cc, cfu, cg] = watch(['clientCharges.freight', 'clientCharges.otherCharges', 'clientCharges.fuel', 'clientCharges.gst']);
  const [vf, vc, vfu, vg] = watch(['vendorCharges.freight', 'vendorCharges.otherCharges', 'vendorCharges.fuel', 'vendorCharges.gst']);
  const clientTotal = [cf, cc, cfu, cg].reduce((sum, v) => sum + (Number(v) || 0), 0);
  const vendorTotal = [vf, vc, vfu, vg].reduce((sum, v) => sum + (Number(v) || 0), 0);

  return (
    <form onSubmit={handleSubmit((values) => onSubmit({ ...values, clientCharges: { ...values.clientCharges, total: clientTotal }, vendorCharges: { ...values.vendorCharges, total: vendorTotal } }))} noValidate>
      {lookupError && <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>Could not load clients/vendors: {lookupError}</div>}

      <div className="form-section">
        <h4 className="form-section__title">Shipment Details</h4>
        <div className="form-grid-3">
          <FormInput label="AWB No" required error={errors.awbNo?.message} {...register('awbNo')} />
          <FormInput label="Reference No" error={errors.refNo?.message} {...register('refNo')} />
          <FormDatePicker label="Booking Date" required error={errors.bookingDate?.message} {...register('bookingDate')} />
        </div>
        <div className="form-grid-3">
          <FormSelect label="Client" required options={clientOptions} error={errors.clientId?.message} {...register('clientId')} />
          <FormSelect label="Business Type" required options={BUSINESS_TYPE_OPTIONS} error={errors.businessType?.message} {...register('businessType')} />
          <FormSelect label="Packet Type" required options={PACKET_TYPE_OPTIONS} error={errors.packetType?.message} {...register('packetType')} />
        </div>
        <div className="form-grid-3">
          <FormSelect label="Payment Type" required options={PAYMENT_TYPE_OPTIONS} error={errors.paymentType?.message} {...register('paymentType')} />
          <FormInput label="Amount" type="number" step="0.01" required error={errors.amount?.message} {...register('amount')} />
          <FormSelect label="Currency" required options={CURRENCY_OPTIONS} error={errors.currency?.message} {...register('currency')} />
        </div>
        <div className="form-grid">
          <FormInput label="Invoice No" error={errors.invoiceNo?.message} {...register('invoiceNo')} />
          <FormInput label="Packet Description" error={errors.packetDescription?.message} {...register('packetDescription')} />
        </div>
        <FormInput label="Invoice Description" containerClassName="mb-0" error={errors.invoiceDescription?.message} {...register('invoiceDescription')} />
      </div>

      <AddressFieldset title="Consignor" prefix="consignor" register={register} errors={errors} variant="consignor" />
      <AddressFieldset title="Consignee" prefix="consignee" register={register} errors={errors} variant="consignee" />

      <div className="form-section">
        <h4 className="form-section__title">Weight Details</h4>
        <div className="form-grid-3">
          <FormInput label="Pieces" type="number" required error={errors.weightDetails?.pieces?.message} {...register('weightDetails.pieces')} />
          <FormInput label="Actual Weight" type="number" step="0.01" required error={errors.weightDetails?.actualWeight?.message} {...register('weightDetails.actualWeight')} />
          <FormInput label="Vendor Weight" type="number" step="0.01" error={errors.weightDetails?.vendorWeight?.message} {...register('weightDetails.vendorWeight')} />
        </div>
        <div className="form-grid-3">
          <FormSelect label="Weight Unit" required options={WEIGHT_UNIT_OPTIONS} error={errors.weightDetails?.weightUnit?.message} {...register('weightDetails.weightUnit')} />
          <FormInput label="Total Value" type="number" step="0.01" error={errors.weightDetails?.totalValue?.message} {...register('weightDetails.totalValue')} />
          <FormSelect label="Value Currency" options={CURRENCY_OPTIONS} error={errors.weightDetails?.valueCurrency?.message} {...register('weightDetails.valueCurrency')} />
        </div>
        <div className="form-grid">
          <FormInput label="Volumetric Divisor" type="number" hint="Used for L×W×H÷divisor calc" error={errors.weightDetails?.divisor?.message} {...register('weightDetails.divisor')} />
          <div className="form-field">
            <span className="form-label">Volumetric Shipment</span>
            <label className="checkbox-row">
              <input type="checkbox" {...register('weightDetails.isVolumetric')} /> This shipment is charged on volumetric weight
            </label>
          </div>
        </div>
        <WeightBoxesFieldArray control={control} register={register} watch={watch} setValue={setValue} />
      </div>

      <div className="form-section">
        <h4 className="form-section__title">Forwarding Details</h4>
        <div className="form-grid-3">
          <FormSelect label="Vendor" required options={vendorOptions} error={errors.forwarding?.vendorId?.message} {...register('forwarding.vendorId')} />
          <FormInput label="Service Type" error={errors.forwarding?.serviceType?.message} {...register('forwarding.serviceType')} />
          <FormInput label="Packaging" error={errors.forwarding?.packaging?.message} {...register('forwarding.packaging')} />
        </div>
        <div className="form-grid-3">
          <FormInput label="Forwarding No 1" error={errors.forwarding?.forwardingNo1?.message} {...register('forwarding.forwardingNo1')} />
          <FormInput label="Forwarding No 2" error={errors.forwarding?.forwardingNo2?.message} {...register('forwarding.forwardingNo2')} />
          <FormInput label="Vendor Account No" error={errors.forwarding?.vendorAccountNo?.message} {...register('forwarding.vendorAccountNo')} />
        </div>
        <div className="form-grid-3">
          <FormInput label="Duties Account No" error={errors.forwarding?.dutiesAccountNo?.message} {...register('forwarding.dutiesAccountNo')} />
          <FormSelect label="Bill Duties To" options={BILL_TO_OPTIONS} error={errors.forwarding?.billDutiesTo?.message} {...register('forwarding.billDutiesTo')} />
          <FormSelect label="Bill Shipment To" options={BILL_TO_OPTIONS} error={errors.forwarding?.billShipmentTo?.message} {...register('forwarding.billShipmentTo')} />
        </div>
        <div className="form-grid-3">
          <FormInput label="Pickup Point" error={errors.forwarding?.pickupPoint?.message} {...register('forwarding.pickupPoint')} />
          <FormSelect label="Incoterms" options={INCOTERMS_OPTIONS} error={errors.forwarding?.incoterms?.message} {...register('forwarding.incoterms')} />
          <FormInput label="Shipment Purpose" error={errors.forwarding?.shipmentPurpose?.message} {...register('forwarding.shipmentPurpose')} />
        </div>
      </div>

      <div className="form-section">
        <h4 className="form-section__title">Charges</h4>
        <div className="grid-2">
          <div>
            <p className="fw-medium text-sm" style={{ marginBottom: 8 }}>Client Charges</p>
            <div className="form-grid">
              <FormInput label="Freight" type="number" step="0.01" {...register('clientCharges.freight')} />
              <FormInput label="Other Charges" type="number" step="0.01" {...register('clientCharges.otherCharges')} />
            </div>
            <div className="form-grid">
              <FormInput label="Fuel" type="number" step="0.01" {...register('clientCharges.fuel')} />
              <FormInput label="GST" type="number" step="0.01" {...register('clientCharges.gst')} />
            </div>
            <p className="text-sm"><strong>Total: {formatCurrency(clientTotal, watch('currency') || 'INR')}</strong></p>
          </div>
          <div>
            <p className="fw-medium text-sm" style={{ marginBottom: 8 }}>Vendor Charges</p>
            <div className="form-grid">
              <FormInput label="Freight" type="number" step="0.01" {...register('vendorCharges.freight')} />
              <FormInput label="Other Charges" type="number" step="0.01" {...register('vendorCharges.otherCharges')} />
            </div>
            <div className="form-grid">
              <FormInput label="Fuel" type="number" step="0.01" {...register('vendorCharges.fuel')} />
              <FormInput label="GST" type="number" step="0.01" {...register('vendorCharges.gst')} />
            </div>
            <p className="text-sm"><strong>Total: {formatCurrency(vendorTotal, watch('currency') || 'INR')}</strong></p>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4 className="form-section__title">Remarks</h4>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Operation Remarks</label>
            <textarea className="form-control" rows={3} {...register('operationRemarks')} />
          </div>
          <div className="form-field">
            <label className="form-label">Accounting Remarks</label>
            <textarea className="form-control" rows={3} {...register('accountingRemarks')} />
          </div>
        </div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            <X size={15} /> Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          <Save size={15} /> {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
