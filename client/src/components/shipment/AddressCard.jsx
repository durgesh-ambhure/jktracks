export default function AddressCard({ title, address = {} }) {
  return (
    <div className="card">
      <div className="card__header">
        <h3 className="card__title">{title}</h3>
      </div>
      <div className="card__body">
        <p className="fw-semibold" style={{ marginBottom: 4 }}>{address.name || '-'}</p>
        {address.contactPerson && <p className="text-sm text-muted" style={{ marginBottom: 8 }}>Attn: {address.contactPerson}</p>}
        <p className="text-sm" style={{ marginBottom: 4 }}>
          {[address.address1, address.address2, address.address3].filter(Boolean).join(', ') || '-'}
        </p>
        <p className="text-sm" style={{ marginBottom: 12 }}>
          {[address.city, address.state, address.pincode, address.country].filter(Boolean).join(', ')}
        </p>
        <div className="grid-2 text-sm">
          <div><span className="text-muted">Phone: </span>{address.phone || '-'}</div>
          <div><span className="text-muted">Alt Phone: </span>{address.phone2 || '-'}</div>
          <div><span className="text-muted">Email: </span>{address.email || '-'}</div>
          <div><span className="text-muted">PAN: </span>{address.pan || '-'}</div>
          <div><span className="text-muted">GSTIN: </span>{address.gstin || '-'}</div>
          <div><span className="text-muted">IEC: </span>{address.iec || '-'}</div>
          {address.bankAC && <div><span className="text-muted">Bank A/C: </span>{address.bankAC}</div>}
          {address.iossNo && <div><span className="text-muted">IOSS No: </span>{address.iossNo}</div>}
        </div>
      </div>
    </div>
  );
}
