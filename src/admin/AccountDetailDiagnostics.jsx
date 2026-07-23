import AccountDetail from './AccountDetail.jsx';
import FailureDiagnostics from './FailureDiagnostics.jsx';

export default function AccountDetailDiagnostics({
  failures,
  failuresLoading,
  failuresError,
  failureDays,
  onFailureDaysChange,
  detail,
  ...accountDetailProps
}) {
  const feeds = Array.isArray(detail?.feeds) ? detail.feeds : [];

  return (
    <div className="min-w-0 border-t border-blue-500/20 [&>div]:border-t-0">
      <div className="min-w-0 px-4 pt-4 md:px-5 md:pt-5">
        <FailureDiagnostics
          failures={failures}
          loading={failuresLoading}
          error={failuresError}
          legacyFeeds={feeds}
          account={detail?.org || detail?.organization || null}
          users={Array.isArray(detail?.users) ? detail.users : []}
          windowDays={failureDays}
          onWindowDaysChange={onFailureDaysChange}
        />
      </div>
      <AccountDetail detail={detail} {...accountDetailProps} />
    </div>
  );
}
