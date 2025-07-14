import {
  CallingState,
  CancelCallConfirmButton,
  Icon,
  LoadingIndicator,
  Notification,
  useCallStateHooks,
  useI18n,
} from "@stream-io/video-react-sdk";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";

import { CallHeaderTitle } from "./call-header-title";
import { ToggleSettingsTabModal } from "./settings/settings-tab-modal";

import { LayoutSelectorProps } from "./layout-selector";
import { Link } from "@tanstack/react-router";

const LatencyIndicator = () => {
  const { useCallStatsReport } = useCallStateHooks();
  const statsReport = useCallStatsReport();
  const latency = statsReport?.publisherStats?.averageRoundTripTimeInMs ?? 0;

  return (
    <div className="flex items-center justify-center [font-variant-numeric:tabular-nums] bg-gray-600 py-0.5 px-4 rounded text-xs font-semibold">
      <div
        className={clsx("h-1.5 w-1.5 mr-1 rounded-full", {
          "bg-green-500": latency && latency <= 100,
          "bg-yellow-500": latency && latency > 100 && latency < 400,
          "bg-red-500": latency && latency > 400,
        })}
      ></div>
      {latency} ms
    </div>
  );
};

const Elapsed = ({ startedAt }: { startedAt: string | undefined }) => {
  const [elapsed, setElapsed] = useState<string>();
  const startedAtDate = useMemo(
    () => (startedAt ? new Date(startedAt).getTime() : Date.now()),
    [startedAt]
  );
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedSeconds = (Date.now() - startedAtDate) / 1000;
      const date = new Date(0);
      date.setSeconds(elapsedSeconds);
      const format = date.toISOString();
      const hours = format.substring(11, 13);
      const minutes = format.substring(14, 16);
      const seconds = format.substring(17, 19);
      const time = `${hours !== "00" ? hours + ":" : ""}${minutes}:${seconds}`;
      setElapsed(time);
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAtDate]);

  return (
    <div className="flex items-center justify-center [font-variant-numeric:tabular-nums] bg-gray-600 py-0.5 px-4 rounded text-xs">
      <Icon className="mr-0.5 bg-green-500 h-4" icon="verified" />
      <div className="font-semibold">{elapsed}</div>
    </div>
  );
};

export const ActiveCallHeader = ({
  onLeave,
  selectedLayout,
  onMenuItemClick,
}: { onLeave: () => void } & LayoutSelectorProps) => {
  const { useCallCallingState, useCallSession } = useCallStateHooks();
  const callingState = useCallCallingState();
  const session = useCallSession();
  const isOffline = callingState === CallingState.OFFLINE;
  const isMigrating = callingState === CallingState.MIGRATING;
  const isJoining = callingState === CallingState.JOINING;
  const isReconnecting = callingState === CallingState.RECONNECTING;
  const hasFailedToRecover = callingState === CallingState.RECONNECTING_FAILED;

  const { t } = useI18n();

  return (
    <>
      <div className="flex items-center justify-between bg-[#101213] rounded-full p-3 z-10 mb-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
            <span className="text-white font-bold text-lg">NH</span>
          </div>
          <h1 className="text-xl font-bold text-green-900 max-lg:hidden">
            NineHertz<span className="text-green-600">Medic</span>
          </h1>
        </Link>

        <div className="sm:hidden">
          <ToggleSettingsTabModal
            layoutProps={{
              selectedLayout: selectedLayout,
              onMenuItemClick: onMenuItemClick,
            }}
            tabModalProps={{
              inMeeting: true,
            }}
          />
        </div>

        <div className="flex gap-2 text-white">
          <Elapsed startedAt={session?.started_at} />
          <div className="hidden sm:flex">
            <LatencyIndicator />
          </div>
        </div>
        <div className="sm:hidden">
          <CancelCallConfirmButton onLeave={onLeave} />
        </div>
      </div>
      <div className="flex justify-center">
        {(() => {
          if (isOffline || hasFailedToRecover) {
            return (
              <Notification
                isVisible
                placement="bottom"
                message={
                  isOffline
                    ? "You are offline. Check your internet connection and try again later."
                    : "Failed to restore connection. Check your internet connection and try again later."
                }
              >
                <span />
              </Notification>
            );
          }

          return (
            <Notification
              isVisible={isJoining || isReconnecting || isMigrating}
              iconClassName={null}
              placement="bottom"
              message={
                <LoadingIndicator
                  text={
                    isMigrating
                      ? "Migrating..."
                      : isJoining
                      ? "Joining..."
                      : "Reconnecting..."
                  }
                />
              }
            >
              <span />
            </Notification>
          );
        })()}
      </div>
    </>
  );
};
