"use client";

import Panel from "@/components/Panel";
import ActivityList from "@/components/panels/ActivityList";
import { useStrava } from "@/hooks/useStrava";

export default function WorkoutsPanel() {
  const {
    status,
    activities,
    hasMore,
    activitiesLoading,
    loadingMore,
    connect,
    disconnect,
    refresh,
    loadMore,
  } = useStrava();

  return (
    <Panel id="panel-workouts" title="Workouts" wide>
      {status === "loading" && (
        <div className="cal-skeleton">
          <div className="skeleton" style={{ width: 160, height: 20 }} />
          <div className="skeleton" style={{ height: 100, marginTop: 12 }} />
        </div>
      )}

      {status === "disconnected" && (
        <div className="cal-connect">
          <p className="cal-connect-text">
            Connect Strava to see your recent runs and rides here. It stays
            read-only and private to you.
          </p>
          <button type="button" className="btn-primary" onClick={connect}>
            Connect Strava
          </button>
        </div>
      )}

      {status === "needs-reconnect" && (
        <div className="cal-connect">
          <p className="cal-connect-text">
            Your Strava connection expired. Reconnect to keep seeing your
            activities.
          </p>
          <button type="button" className="btn-primary" onClick={connect}>
            Reconnect Strava
          </button>
        </div>
      )}

      {status === "connected" && (
        <>
          <div className="cal-toolbar">
            <div className="cal-account">
              <button type="button" className="cal-disconnect" onClick={refresh}>
                Refresh
              </button>
              <button type="button" className="cal-disconnect" onClick={disconnect}>
                Disconnect
              </button>
            </div>
          </div>
          {activitiesLoading ? (
            <div className="cal-skeleton">
              <div className="skeleton" style={{ height: 100 }} />
            </div>
          ) : (
            <ActivityList
              activities={activities}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={loadMore}
            />
          )}
        </>
      )}
    </Panel>
  );
}
