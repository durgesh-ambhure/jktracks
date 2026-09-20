import PageHeader from '../../components/common/PageHeader';
import AccountingEntryForm from '../../components/accounting/AccountingEntryForm';

export default function JournalEntryPage() {
  return (
    <div>
      <PageHeader title="Journal Entry" subtitle="Post a double-entry journal voucher" />
      <AccountingEntryForm entryKey="journal" particularsLabel="Journal Narration" />
    </div>
  );
}
