import AccountDetail from './AccountDetail.jsx';
import FailureDiagnostics from './FailureDiagnostics.jsx';
import FeedFailureDiagnostics from './FeedFailureDiagnostics.jsx';
import GlobalPostMonitor from './GlobalPostMonitor.jsx';

export default function AccountDetailDiagnostics({
  orgId,
  onUnauthorized,
  failures,
  failuresLoading,
  failuresError,
  failureDays,
  onFailureDaysChange,
  feedFailures,
  feedFailuresLoading,
  feedFailuresError,
  feedFailureDays,
  onFeedFailureDaysChange,
  detail,
  ...accountDetailProps
}) {
  const feeds = Array.isArray(detail?.feeds) ? detail.feeds : [];

  return (
    <div className="min-w-0 border-t border-blue-500/20 [&>div]:border-t-0">
      <div className="min-w-0 px-4 pt-4 md:px-5 md:pt-5">
        <div className="grid min-w-0 items-start gap-4 xl:grid-cols-2">
          <GlobalPostMonitor orgId={orgId} onUnauthorized={onUnauthorized} />
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
          <FeedFailureDiagnostics
            failures={feedFailures}
            feeds={feeds}
            loading={feedFailuresLoading}
            error={feedFailuresError}
            account={detail?.org || detail?.organization || null}
            windowDays={feedFailureDays}
            onWindowDaysChange={onFeedFailureDaysChange}
          />
        </div>
      </div>
      <AccountDetail orgId={orgId} detail={detail} {...accountDetailProps} />
    </div>
  );
}
