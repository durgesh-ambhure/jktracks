import PageHeader from '../../components/common/PageHeader';
import AccountingEntryForm from '../../components/accounting/AccountingEntryForm';

export default function ReceiptEntryPage() {
  return (
    <div>
      <PageHeader title="Receipt Entry" subtitle="Record a receipt voucher" />
      <AccountingEntryForm entryKey="receipts" particularsLabel="Received From" />
    </div>
  );
}
