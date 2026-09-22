import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { Save, X } from 'lucide-react';
import AddressFieldset from './AddressFieldset';
import WeightBoxesFieldArray from './WeightBoxesFieldArray';
import InvoiceItemsFieldArray from './InvoiceItemsFieldArray';
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
  INVOICE_TYPE_OPTIONS,
  INVOICE_NOTE_OPTIONS,
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
  kycType: Joi.string().allow(''),
  kycNumber: Joi.string().allow(''),
  kycDocument1: Joi.string().allow(''),
  kycDocument2: Joi.string().allow(''),
});

const schema = Joi.object({
  awbNo: Joi.string().required().messages({ 'string.empty': 'AWB No is required' }),
  refNo: Joi.string().allow(''),
  bookingDate: Joi.string().required().messages({ 'string.empty': 'Booking date is required' }),
  clientId: Joi.string().required().messages({ 'string.empty': 'Client is required' }),
  businessType: Joi.string().valid(...BUSINESS_TYPE_OPTIONS).required().messages({ 'any.only': 'Select a business type', 'string.empty': 'Select a business type' }),
  originCode: Joi.string().allow(''),
  originName: Joi.string().allow(''),
  originZone: Joi.string().allow(''),
  destCode: Joi.string().allow(''),
  destName: Joi.string().allow(''),
  destZone: Joi.string().allow(''),
  product: Joi.string().allow(''),
  consignor: addressSchema,
  consignee: addressSchema,
  packetType: Joi.string().valid(...PACKET_TYPE_OPTIONS).required().messages({ 'any.only': 'Select a packet type', 'string.empty': 'Select a packet type' }),
  paymentType: Joi.string().valid(...PAYMENT_TYPE_OPTIONS).required().messages({ 'any.only': 'Select a payment type', 'string.empty': 'Select a payment type' }),
  amount: Joi.number().min(0).required().messages({ 'number.base': 'Amount is required' }),
  currency: Joi.string().required().messages({ 'string.empty': 'Currency is required' }),
  invoiceDate: Joi.string().allow(''),
  invoiceNo: Joi.string().allow(''),
  eWayBill: Joi.string().allow(''),
  codAmount: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
  insAmount: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
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
    chargeableWeight: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
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
  invoice: Joi.object({
    createInvoice: Joi.boolean().default(false),
    invoiceType: Joi.string().allow(''),
    noteType: Joi.string().allow(''),
    items: Joi.array().items(Joi.object({
      boxNo: Joi.string().allow(''),
      srNo: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
      description: Joi.string().allow(''),
      hsCode: Joi.string().allow(''),
      unitType: Joi.string().allow(''),
      quantity: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
      unitWeight: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
      igst: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
      unitRate: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
      amount: Joi.alternatives().try(Joi.number(), Joi.string().allow('')),
    })).default([]),
  }),
  operationRemarks: Joi.string().allow(''),
  accountingRemarks: Joi.string().allow(''),
});

const emptyAddress = {
  name: '', contactPerson: '', address1: '', address2: '', address3: '', pincode: '',
  country: 'India', state: '', city: '', phone: '', phone2: '', email: '', pan: '', gstin: '',
  iec: '', aadhaarNo: '', bankADCode: '', bankAC: '', bankIFSC: '', iossNo: '', iossAmount: '',
  kycType: '', kycNumber: '', kycDocument1: '', kycDocument2: '',
};

const defaultShipment = {
  awbNo: '', refNo: '', bookingDate: toInputDate(new Date()), clientId: '', businessType: 'B2C',
  originCode: '', originName: '', originZone: '', destCode: '', destName: '', destZone: '', product: '',
  consignor: emptyAddress, consignee: { ...emptyAddress },
  packetType: 'DOX', paymentType: 'CASH', amount: '', currency: 'INR',
  invoiceDate: toInputDate(new Date()), invoiceNo: '', eWayBill: '', codAmount: '', insAmount: '',
  packetDescription: '', invoiceDescription: INVOICE_NOTE_OPTIONS[0].text,
  weightDetails: { pieces: 1, actualWeight: '', vendorWeight: '', weightUnit: 'KGS', totalValue: '', valueCurrency: 'INR', divisor: 5000, isVolumetric: false, chargeableWeight: 0, boxes: [] },
  forwarding: { vendorId: '', serviceType: '', packaging: '', forwardingNo1: '', forwardingNo2: '', vendorAccountNo: '', dutiesAccountNo: '', billDutiesTo: 'SENDER', billShipmentTo: 'SENDER', pickupPoint: '', incoterms: 'DDU', shipmentPurpose: '' },
  clientCharges: { freight: '', otherCharges: '', fuel: '', gst: '' },
  vendorCharges: { freight: '', otherCharges: '', fuel: '', gst: '' },
  invoice: { createInvoice: false, invoiceType: 'INVOICE', noteType: INVOICE_NOTE_OPTIONS[0].value, items: [] },
  operationRemarks: '', accountingRemarks: '',
};

export default function ShipmentForm({ defaultValues, onSubmit, submitting, submitLabel = 'Create AWB', onCancel }) {
  const [clients, setClients] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [lookupError, setLookupError] = useState('');
  const noteTypeMounted = useRef(false);

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

  const actualWeightWatched = watch('weightDetails.actualWeight');
  const boxesWatched = watch('weightDetails.boxes') || [];
  const boxesKey = JSON.stringify(boxesWatched.map((b) => [b?.boxNo, b?.volumetricWeight]));
  useEffect(() => {
    const totalVolumetric = boxesWatched.reduce((sum, b) => sum + (Number(b?.volumetricWeight) || 0), 0);
    const chargeable = Math.max(Number(actualWeightWatched) || 0, totalVolumetric);
    setValue('weightDetails.chargeableWeight', Number(chargeable.toFixed(2)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualWeightWatched, boxesKey]);
  const boxOptions = boxesWatched.map((b, i) => b?.boxNo || String(i + 1));

  const createInvoice = watch('invoice.createInvoice');
  const noteType = watch('invoice.noteType');
  useEffect(() => {
    if (!noteTypeMounted.current) {
      noteTypeMounted.current = true;
      return;
    }
    const preset = INVOICE_NOTE_OPTIONS.find((o) => o.value === noteType);
    if (preset) setValue('invoiceDescription', preset.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteType]);

  return (
    <form onSubmit={handleSubmit((values) => onSubmit({ ...values, clientCharges: { ...values.clientCharges, total: clientTotal }, vendorCharges: { ...values.vendorCharges, total: vendorTotal } }))} noValidate>
      {lookupError && <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>Could not load clients/vendors: {lookupError}</div>}

      <div className="awb-columns">
        <div className="form-section">
          <h4 className="form-section__title">Shipment Details</h4>
          <FormInput label="AWB No" required error={errors.awbNo?.message} {...register('awbNo')} />
          <FormSelect label="Client" required options={clientOptions} error={errors.clientId?.message} {...register('clientId')} />
          <FormSelect label="Business Type" required options={BUSINESS_TYPE_OPTIONS} error={errors.businessType?.message} {...register('businessType')} />
          <FormSelect label="Packet Type" required options={PACKET_TYPE_OPTIONS} error={errors.packetType?.message} {...register('packetType')} />
          <FormInput label="Origin Code" error={errors.originCode?.message} {...register('originCode')} />
          <FormInput label="Origin Name" error={errors.originName?.message} {...register('originName')} />
          <FormInput label="Origin Zone" error={errors.originZone?.message} {...register('originZone')} />
          <FormInput label="Destination Code" error={errors.destCode?.message} {...register('destCode')} />
          <FormInput label="Destination Name" error={errors.destName?.message} {...register('destName')} />
          <FormInput label="Destination Zone" error={errors.destZone?.message} {...register('destZone')} />
          <FormInput label="Product" error={errors.product?.message} {...register('product')} />
          <FormInput label="Service" error={errors.forwarding?.serviceType?.message} {...register('forwarding.serviceType')} />
          <FormDatePicker label="Booking Date" required error={errors.bookingDate?.message} {...register('bookingDate')} />
          <FormInput label="Reference No" error={errors.refNo?.message} {...register('refNo')} />
          <FormInput label="Forwarding No 2" error={errors.forwarding?.forwardingNo2?.message} {...register('forwarding.forwardingNo2')} />
          <FormSelect label="Payment Type" required options={PAYMENT_TYPE_OPTIONS} error={errors.paymentType?.message} {...register('paymentType')} />
          <FormInput label="Shipment Value" type="number" step="0.01" required error={errors.amount?.message} {...register('amount')} />
          <FormSelect label="Currency" required options={CURRENCY_OPTIONS} error={errors.currency?.message} {...register('currency')} />
          <FormDatePicker label="Invoice Date" error={errors.invoiceDate?.message} {...register('invoiceDate')} />
          <FormInput label="Invoice No" error={errors.invoiceNo?.message} {...register('invoiceNo')} />
          <FormInput label="EWay Bill" error={errors.eWayBill?.message} {...register('eWayBill')} />
          <FormInput label="COD Amount" type="number" step="0.01" error={errors.codAmount?.message} {...register('codAmount')} />
          <FormInput label="Ins Amount" type="number" step="0.01" error={errors.insAmount?.message} {...register('insAmount')} />
          <div className="form-field">
            <label className="form-label">Content</label>
            <textarea className="form-control" rows={2} {...register('packetDescription')} />
          </div>
        </div>

        <AddressFieldset title="Shipper / Consignor / From" prefix="consignor" register={register} errors={errors} variant="consignor" watch={watch} setValue={setValue} />
        <AddressFieldset title="Consignee / Receiver / To" prefix="consignee" register={register} errors={errors} variant="consignee" watch={watch} setValue={setValue} />
      </div>

      <div className="form-section">
        <h4 className="form-section__title">Weight Details</h4>
        <div className="form-grid-4">
          <FormInput label="Pieces" type="number" required error={errors.weightDetails?.pieces?.message} {...register('weightDetails.pieces')} />
          <FormInput label="Actual Weight" type="number" step="0.01" required error={errors.weightDetails?.actualWeight?.message} {...register('weightDetails.actualWeight')} />
          <FormInput label="Vendor Weight" type="number" step="0.01" error={errors.weightDetails?.vendorWeight?.message} {...register('weightDetails.vendorWeight')} />
          <FormSelect label="Weight Unit" required options={WEIGHT_UNIT_OPTIONS} error={errors.weightDetails?.weightUnit?.message} {...register('weightDetails.weightUnit')} />
        </div>
        <div className="form-grid-4">
          <FormInput label="Total Value" type="number" step="0.01" error={errors.weightDetails?.totalValue?.message} {...register('weightDetails.totalValue')} />
          <FormSelect label="Value Currency" options={CURRENCY_OPTIONS} error={errors.weightDetails?.valueCurrency?.message} {...register('weightDetails.valueCurrency')} />
          <FormInput label="Volumetric Divisor" type="number" hint="Used for L×W×H÷divisor calc" error={errors.weightDetails?.divisor?.message} {...register('weightDetails.divisor')} />
          <div className="form-field">
            <span className="form-label">Volumetric Shipment</span>
            <label className="checkbox-row">
              <input type="checkbox" {...register('weightDetails.isVolumetric')} /> Charged on volumetric weight
            </label>
          </div>
        </div>
        <div className="form-grid-4">
          <FormInput label="Chargeable Weight" readOnly hint="max(actual, volumetric)" {...register('weightDetails.chargeableWeight')} />
        </div>
        <WeightBoxesFieldArray control={control} register={register} watch={watch} setValue={setValue} />
      </div>

      <div className="form-section">
        <h4 className="form-section__title">Forwarding Details</h4>
        <div className="form-grid-4">
          <FormSelect label="Vendor" required options={vendorOptions} error={errors.forwarding?.vendorId?.message} {...register('forwarding.vendorId')} />
          <FormInput label="Packaging" error={errors.forwarding?.packaging?.message} {...register('forwarding.packaging')} />
          <FormInput label="Forwarding No 1" error={errors.forwarding?.forwardingNo1?.message} {...register('forwarding.forwardingNo1')} />
          <FormInput label="Vendor Account No" error={errors.forwarding?.vendorAccountNo?.message} {...register('forwarding.vendorAccountNo')} />
        </div>
        <div className="form-grid-4">
          <FormInput label="Duties Account No" error={errors.forwarding?.dutiesAccountNo?.message} {...register('forwarding.dutiesAccountNo')} />
          <FormSelect label="Bill Duties To" options={BILL_TO_OPTIONS} error={errors.forwarding?.billDutiesTo?.message} {...register('forwarding.billDutiesTo')} />
          <FormSelect label="Bill Shipment To" options={BILL_TO_OPTIONS} error={errors.forwarding?.billShipmentTo?.message} {...register('forwarding.billShipmentTo')} />
          <FormInput label="Pickup Point" error={errors.forwarding?.pickupPoint?.message} {...register('forwarding.pickupPoint')} />
        </div>
        <div className="form-grid">
          <FormSelect label="Incoterms" options={INCOTERMS_OPTIONS} error={errors.forwarding?.incoterms?.message} {...register('forwarding.incoterms')} />
          <FormInput label="Shipment Purpose" error={errors.forwarding?.shipmentPurpose?.message} {...register('forwarding.shipmentPurpose')} />
        </div>
      </div>

      <div className="form-section">
        <h4 className="form-section__title">Charges</h4>
        <div className="grid-2">
          <div>
            <p className="fw-medium text-sm" style={{ marginBottom: 6 }}>Client Charges</p>
            <div className="form-grid">
              <FormInput label="Freight" type="number" step="0.01" {...register('clientCharges.freight')} />
              <FormInput label="Other Charges" type="number" step="0.01" {...register('clientCharges.otherCharges')} />
              <FormInput label="Fuel" type="number" step="0.01" {...register('clientCharges.fuel')} />
              <FormInput label="GST" type="number" step="0.01" {...register('clientCharges.gst')} />
            </div>
            <p className="text-sm"><strong>Total: {formatCurrency(clientTotal, watch('currency') || 'INR')}</strong></p>
          </div>
          <div>
            <p className="fw-medium text-sm" style={{ marginBottom: 6 }}>Vendor Charges</p>
            <div className="form-grid">
              <FormInput label="Freight" type="number" step="0.01" {...register('vendorCharges.freight')} />
              <FormInput label="Other Charges" type="number" step="0.01" {...register('vendorCharges.otherCharges')} />
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

      <div className="form-section">
        <h4 className="form-section__title">Shipment Invoice</h4>
        <label className="checkbox-row" style={{ marginBottom: 'var(--space-3)' }}>
          <input type="checkbox" {...register('invoice.createInvoice')} /> Create Shipment Invoice?
        </label>

        {createInvoice && (
          <>
            <div className="form-grid-4">
              <FormSelect label="Invoice Type" options={INVOICE_TYPE_OPTIONS} {...register('invoice.invoiceType')} />
              <FormSelect
                label="Currency"
                options={CURRENCY_OPTIONS}
                value={watch('currency') || ''}
                onChange={(e) => setValue('currency', e.target.value)}
              />
              <FormSelect
                label="Incoterms"
                options={INCOTERMS_OPTIONS}
                value={watch('forwarding.incoterms') || ''}
                onChange={(e) => setValue('forwarding.incoterms', e.target.value)}
              />
              <FormSelect
                label="Note"
                options={INVOICE_NOTE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                {...register('invoice.noteType')}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Note Text</label>
              <textarea className="form-control" rows={2} {...register('invoiceDescription')} />
            </div>

            <h4 className="form-section__title">Shipment Invoice Items</h4>
            <InvoiceItemsFieldArray control={control} register={register} watch={watch} setValue={setValue} boxOptions={boxOptions} />
          </>
        )}
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
