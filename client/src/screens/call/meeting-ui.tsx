import {
  CallingState,
  defaultSortPreset,
  LoadingIndicator,
  useCall,
  useCallStateHooks,
  usePersistedDevicePreferences,
} from "@stream-io/video-react-sdk";
import { useRouter } from "@tanstack/react-router";
import { JSX, useCallback, useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useSettings } from "@/screens/call/context/settings-context";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-hotkeys";
import { usePersistedVideoFilter } from "@/hooks/use-persist-video-filters";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { DEVICE_PREFERENCE_KEY } from "@/hooks/use-device-preference-selection";
import { ActiveCall } from "@/screens/call/active-call";
import { DefaultAppHeader } from "@/screens/call/default-app-header";
import { Lobby, UserMode } from "@/screens/call/lobby";

const contents = {
  "error-join": {
    heading: "Failed to join the call",
  },
  "error-leave": {
    heading: "Error when disconnecting",
  },
};

type MeetingUIProps = {
  chatClient?: StreamChat | null;
  mode?: UserMode;
};
export const MeetingUI = ({ chatClient, mode }: MeetingUIProps) => {
  const [show, setShow] = useState<
    "lobby" | "error-join" | "error-leave" | "loading" | "active-call" | "left"
  >("lobby");
  const [lastError, setLastError] = useState<Error>();
  const router = useRouter();
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callState = useCallCallingState();
  const {
    settings: { deviceSelectionPreference },
  } = useSettings();

  const onJoin = useCallback(
    async ({ fastJoin = false } = {}) => {
      if (!fastJoin) setShow("loading");
      if (!call) throw new Error("No active call found");
      try {
        if (call.state.callingState !== CallingState.JOINED) {
          await call.join({ create: true });
        }
        setShow("active-call");
      } catch (e) {
        console.error(e);
        setLastError(e as Error);
        setShow("error-join");
      }
    },
    [call]
  );

  const onLeave = useCallback(
    async ({ withFeedback = true }: { withFeedback?: boolean } = {}) => {
      if (!withFeedback) return;
      try {
        setShow("left");
      } catch (e) {
        console.error(e);
        setLastError(e as Error);
        setShow("error-leave");
      }
    },
    []
  );

  useEffect(() => {
    if (callState === CallingState.LEFT) {
      onLeave({ withFeedback: false }).catch(console.error);
    }
  }, [callState, onLeave]);

  useEffect(() => {
    if (!call) return;
    return call.on("call.ended", async (e) => {
      if (!e.user || e.user.id === call.currentUserId) return;
      alert(`Call ended for everyone by: ${e.user.name || e.user.id}`);
      if (call.state.callingState !== CallingState.LEFT) {
        await call.leave();
      }
      setShow("left");
    });
  }, [call, router]);

  useEffect(() => {
    const handlePageLeave = async () => {
      if (call) {
        await call.leave();
      }
    };
    handlePageLeave()
  }, [call, callState]);

  useEffect(() => {
    if (!call) return;
    call.setSortParticipantsBy(defaultSortPreset);
  }, [call]);

  useKeyboardShortcuts();
  useWakeLock();
  usePersistedVideoFilter("@pronto/video-filter");

  let childrenToRender: JSX.Element;
  if (show === "error-join" || show === "error-leave") {
    childrenToRender = (
      <ErrorPage
        heading={contents[show].heading}
        error={lastError}
        onClickHome={() => router.navigate({to:`/`})}
        onClickLobby={() => setShow("lobby")}
      />
    );
  } else if (show === "lobby") {
    childrenToRender = <Lobby onJoin={onJoin} mode={mode} />;
  } else if (show === "loading") {
    childrenToRender = <LoadingScreen />;
  } else if (show === "left") {
    childrenToRender = <DefaultAppHeader />;
  } else if (!call) {
    childrenToRender = (
      <ErrorPage
        heading={"Lost active call connection"}
        onClickHome={() => router.navigate({to:`/`})}
        onClickLobby={() => setShow("lobby")}
      />
    );
  } else {
    childrenToRender = (
      <ActiveCall
        activeCall={call}
        chatClient={chatClient}
        onLeave={onLeave}
        onJoin={onJoin}
      />
    );
  }

  return (
    <>
      {childrenToRender}
      {deviceSelectionPreference === "recent" && (
        <PersistedDevicePreferencesHelper />
      )}
    </>
  );
};

type ErrorPageProps = {
  heading: string;
  error?: Error;
  onClickHome: () => void;
  onClickLobby: () => void;
};

const ErrorPage = ({
  heading,
  onClickHome,
  onClickLobby,
  error,
}: ErrorPageProps) => (
  <div className="flex h-full bg-background text-foreground">
    <div className="flex flex-col items-center justify-center w-full h-full p-6">
      <h1 className="mb-6 text-2xl font-semibold">{heading}</h1>
      <div className="mb-6 text-center">
        {error?.stack && (
          <div className="mb-4">
            <pre className="p-4 overflow-auto text-sm bg-muted rounded-md max-h-40">
              {error.stack}
            </pre>
          </div>
        )}
        <p className="text-muted-foreground">(see the console for more info)</p>
      </div>

      <div className="flex gap-3 w-full max-w-md">
        <button
          data-testid="return-home-button"
          className="flex-1 px-4 py-2 font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onClickHome}
        >
          Return home
        </button>

        <button
          data-testid="return-lobby-button"
          className="flex-1 px-4 py-2 font-medium border rounded-md bg-background text-foreground border-input hover:bg-accent"
          onClick={onClickLobby}
        >
          Back to lobby
        </button>
      </div>
    </div>
  </div>
);

export const LoadingScreen = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const message =
    callingState === CallingState.RECONNECTING
      ? "Please wait, we are connecting you to the call..."
      : "";

  return (
    <div className="flex items-center justify-center w-full h-full bg-background">
      <div className="flex items-center justify-center w-full h-full">
        <LoadingIndicator
          text={message}
          className="[&_.str-video__loading-indicator__icon]:h-16 [&_.str-video__loading-indicator__icon]:w-16 [&_.str-video__loading-indicator__icon]:bg-mask-size-16"
        />
      </div>
    </div>
  );
};

function PersistedDevicePreferencesHelper() {
  usePersistedDevicePreferences(DEVICE_PREFERENCE_KEY);
  return null;
}
