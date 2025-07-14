import {
  Call,
  CallingState,
  CallParticipantsList,
  CancelCallConfirmButton,
  CompositeButton,
  Icon,
  OwnCapability,
  PermissionRequests,
  PipLayout,
  ReactionsButton,
  RecordCallConfirmationButton,
  RecordingInProgressNotification,
  Restricted,
  ScreenShareButton,
  SpeakingWhileMutedNotification,
  useCallStateHooks,
  useI18n,
  WithTooltip,
} from "@stream-io/video-react-sdk";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";

import { ActiveCallHeader } from "./active-call-header";
import { CallStatsSidebar, ToggleStatsButton } from "./call-stats-wrapper";
import { ToggleClosedCaptionsButton } from "./closed-captions";
import { Stage } from "./stage";
import { IncomingVideoSettingsButton } from "./incoming-video-settings";
import { InvitePanel } from "./invite-panel/invite-panel";
import { ToggleSettingsTabModal } from "./settings/settings-tab-modal";
import { ToggleDualCameraButton } from "./toggle-dual-camera-button";
import { ToggleDualMicButton } from "./toggle-dual-mic-button";
import { ToggleEffectsButton } from "./toggle-effects-button";
import { ToggleLayoutButton } from "./toggle-layout-button";
import { ToggleNoiseCancellationButton } from "./toggle-noise-cancellation-button";
import { ToggleParticipantListButton } from "./toggle-participant-list-button";
import { useBreakpoint } from "@/hooks/use-breakpoints";
import { useLayoutSwitcher } from "@/hooks/use-layout-map";

import { usePipWindow } from "@/hooks/use-pip-window";
import { useWatchChannel } from "@/hooks/use-watch-channel";
import { StagePip } from "./stage-pip";
import { useNotificationSounds } from "@/hooks/use-notification-sound";
import { PictureInPicture2 } from "lucide-react";

export type ActiveCallProps = {
  chatClient?: StreamChat | null;
  activeCall: Call;
  onLeave: () => void;
  onJoin: ({ fastJoin }: { fastJoin: boolean }) => void;
};

type SidebarContent =
  | "participants"
  | "chat"
  | "stats"
  | "closed-captions"
  | null;

export const MeetingRoom = (props: ActiveCallProps) => {
  const { chatClient, activeCall, onLeave, onJoin } = props;
  const { useParticipantCount } = useCallStateHooks();
  const participantCount = useParticipantCount();

  const { layout, setLayout } = useLayoutSwitcher();
  const breakpoint = useBreakpoint();
  useEffect(() => {
    if (
      (layout === "SpeakerLeft" || layout === "SpeakerRight") &&
      (breakpoint === "xs" || breakpoint === "sm")
    ) {
      setLayout("SpeakerBottom");
    }
  }, [breakpoint, layout, setLayout]);

  const [sidebarContent, setSidebarContent] = useState<SidebarContent>(null);
  const showSidebar = sidebarContent != null;
  const showParticipants = sidebarContent === "participants";
  const showChat = sidebarContent === "chat";
  const showStats = sidebarContent === "stats";

  const channelWatched = useWatchChannel({
    chatClient,
    channelId: activeCall?.id,
  });

  const { t } = useI18n();

  useEffect(() => {
    if (activeCall?.state.callingState === CallingState.IDLE) {
      onJoin({ fastJoin: true });
    }
  }, [activeCall, onJoin]);

  useEffect(() => {
    setSidebarContent(null);
  }, []);

  const {
    isSupported: isPipSupported,
    pipWindow,
    createPipPortal,
    open: openPipWindow,
    close: closePipWindow,
  } = usePipWindow("@pronto/pip");
  useNotificationSounds();

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col w-full flex-1 overflow-hidden">
        <ActiveCallHeader
          selectedLayout={layout}
          onMenuItemClick={setLayout}
          onLeave={onLeave}
        />

        <PermissionRequests />
        <div className="flex min-h-[calc(100dvh-170px)] gap-10 relative flex-1 overflow-hidden">
          <div className="relative flex-1 min-w-0 flex-col flex overflow-hidden">
            {pipWindow ? (
              createPipPortal(
                <StagePip />,
                <>
                  <PipLayout.Host />
                  <button
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-700 text-white hover:bg-gray-600"
                    onClick={closePipWindow}
                  >
                    <Icon className="w-4 h-4" icon="close" />
                    Stop Picture-in-Picture
                  </button>
                </>
              )
            ) : (
              <Stage selectedLayout={layout} />
            )}
          </div>

          <div
            className={cn(
              "flex flex-col w-0 bg-[#101213] transition-all duration-300 ease-in-out rounded-md",
              showSidebar && "w-full max-w-sm"
            )}
          >
            {showSidebar && (
              <div className="flex flex-col h-full overflow-hidden min-h-[calc(100dvh-160px)] max-h-[calc(100dvh-175px)] p-4">
                {showParticipants && (
                  <div className="flex flex-col h-full text-white">
                    <CallParticipantsList
                      onClose={() => setSidebarContent(null)}
                    />
                    <InvitePanel />
                  </div>
                )}

                {showStats && <CallStatsSidebar />}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-center p-2">
          <RecordingInProgressNotification />
          <Restricted
            requiredGrants={[OwnCapability.SEND_AUDIO]}
            hasPermissionsOnly
          >
            <SpeakingWhileMutedNotification />
          </Restricted>
        </div>
        <div
          className="flex justify-between items-center p-4 bg-[#101213] rounded-full"
          data-testid="str-video__call-controls"
        >
          <div className="flex items-center gap-2">
            <div className="hidden md:flex">
              <ToggleSettingsTabModal
                layoutProps={{
                  selectedLayout: layout,
                  onMenuItemClick: setLayout,
                }}
                tabModalProps={{
                  inMeeting: true,
                }}
              />
            </div>

            <div className="hidden md:flex">
              <ToggleLayoutButton
                selectedLayout={layout}
                onMenuItemClick={setLayout}
              />
            </div>

            <div className="md:hidden">
              {/* <ToggleMoreOptionsListButton /> */}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ToggleDualMicButton />
            <ToggleDualCameraButton />
            <div className="hidden md:flex">
              <ToggleEffectsButton />
            </div>
            <div className="hidden md:flex">
              <ToggleNoiseCancellationButton />
            </div>
            <div className="hidden md:flex">
              <ToggleClosedCaptionsButton />
            </div>
            <div className="hidden md:flex">
              <ReactionsButton />
            </div>
            <div className="hidden md:flex">
              <ScreenShareButton />
            </div>

            <div className="hidden md:flex">
              <IncomingVideoSettingsButton />
            </div>

            {isPipSupported && (
              <WithTooltip title={t("Pop out Picture-in-Picture")}>
                <CompositeButton
                  active={!!pipWindow}
                  variant="primary"
                  className="grid place-content-center"
                  onClick={pipWindow ? closePipWindow : openPipWindow}
                >
                  <PictureInPicture2 className="size-4" />
                </CompositeButton>
              </WithTooltip>
            )}
            <RecordCallConfirmationButton />
            <div className="hidden md:flex">
              <CancelCallConfirmButton onLeave={onLeave} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex">
              <ToggleStatsButton
                active={showStats}
                onClick={() => setSidebarContent(showStats ? null : "stats")}
              />
            </div>
            <ToggleParticipantListButton
              active={showParticipants}
              caption=""
              onClick={() => {
                setSidebarContent(showParticipants ? null : "participants");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
