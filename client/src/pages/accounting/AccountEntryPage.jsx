import PageHeader from '../../components/common/PageHeader';
import AccountingEntryForm from '../../components/accounting/AccountingEntryForm';

export default function AccountEntryPage() {
  return (
    <div>
      <PageHeader title="Account Entry" subtitle="Post a general account entry" />
      <AccountingEntryForm entryKey="entries" particularsLabel="Account / Particulars" />
    </div>
  );
}
