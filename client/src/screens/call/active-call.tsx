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
import {cn} from "@/lib/utils"
import { ChatUI } from "./chat-ui";
import { ChatWrapper } from "./chat-wrapper";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";

import { ActiveCallHeader } from "./active-call-header";
import { CallStatsSidebar, ToggleStatsButton } from "./call-stats-wrapper";
import {
  ClosedCaptions,
  ClosedCaptionsSidebar,
  ToggleClosedCaptionsButton,
} from "./closed-captions";
import { Stage } from "./stage";
import { IncomingVideoSettingsButton } from "./incoming-video-settings";
import { InvitePanel } from "./invite-panel/invite-panel";
import { NewMessageNotification } from "./new-message-notification";
import { ToggleSettingsTabModal } from "./settings/settings-tab-modal";
import { ToggleDeveloperButton } from "./toggle-developer-button";
import { ToggleDualCameraButton } from "./toggle-dual-camera-button";
import { ToggleDualMicButton } from "./toggle-dual-mic-button";
import { ToggleEffectsButton } from "./toggle-effects-button";
import { ToggleLayoutButton } from "./toggle-layout-button";
import { ToggleMoreOptionsListButton } from "./toggle-more-options-list-button";
import { ToggleNoiseCancellationButton } from "./toggle-noise-cancellation-button";
import { ToggleParticipantListButton } from "./toggle-participant-list-button";
import { UnreadCountBadge } from "./unread-count-badge";
import { useBreakpoint } from "@/hooks/use-breakpoints";
import { useLayoutSwitcher } from "@/hooks/use-layout-map";
import { useNotificationSounds } from "@/hooks/use-notification-sounds";
import { usePipWindow } from "@/hooks/use-pip-window";
import { useWatchChannel } from "@/hooks/use-watch-channel";
import { StagePip } from "./stage-pip";

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

export const ActiveCall = (props: ActiveCallProps) => {
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
  const showClosedCaptions = sidebarContent === "closed-captions";

  // FIXME: could be replaced with "notification.message_new" but users would have to be at least members
  // possible fix with "allow to join" permissions in place (expensive?)
  const channelWatched = useWatchChannel({
    chatClient,
    channelId: activeCall?.id,
  });

  const { t } = useI18n();

  useEffect(() => {
    // helps with Fast-Refresh
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
    <div className="rd__call">
      <div className="rd__main-call-panel">
        <ActiveCallHeader
          selectedLayout={layout}
          onMenuItemClick={setLayout}
          onLeave={onLeave}
        />

        <PermissionRequests />
        <div className="rd__layout">
          <div className="rd__layout__stage-container">
            {pipWindow ? (
              createPipPortal(
                <StagePip />,
                <>
                  <PipLayout.Host />
                  <button
                    className="rd__button rd__button--secondary rd__button--large rd__stop-pip"
                    onClick={closePipWindow}
                  >
                    <Icon className="rd__button__icon" icon="close" />
                    Stop Picture-in-Picture
                  </button>
                </>
              )
            ) : (
              <Stage selectedLayout={layout} />
            )}
            <ClosedCaptions />
          </div>

          <div
            className={cn("rd__sidebar", showSidebar && "rd__sidebar--open")}
          >
            {showSidebar && (
              <div className="rd__sidebar__container">
                {showParticipants && (
                  <div className="rd__participants">
                    <CallParticipantsList
                      onClose={() => setSidebarContent(null)}
                    />
                    <InvitePanel />
                  </div>
                )}

                {showChat && (
                  <ChatWrapper chatClient={chatClient}>
                    <div className="str-video__chat">
                      <ChatUI
                        onClose={() => {
                          setSidebarContent(null);
                        }}
                        channelId={activeCall.id}
                      />
                    </div>
                  </ChatWrapper>
                )}

                {showStats && <CallStatsSidebar />}
                {showClosedCaptions && <ClosedCaptionsSidebar />}
              </div>
            )}
          </div>
        </div>
        <div className="rd__notifications">
          <RecordingInProgressNotification />
          <Restricted
            requiredGrants={[OwnCapability.SEND_AUDIO]}
            hasPermissionsOnly
          >
            <SpeakingWhileMutedNotification />
          </Restricted>
        </div>
        <div
          className="str-video__call-controls"
          data-testid="str-video__call-controls"
        >
          <div className="str-video__call-controls--group str-video__call-controls--options">
            <div className="str-video__call-controls__desktop">
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

            <div className="str-video__call-controls__desktop">
              <ToggleLayoutButton
                selectedLayout={layout}
                onMenuItemClick={setLayout}
              />
            </div>

            <div className="str-video__call-controls__desktop">
              <ToggleDeveloperButton />
            </div>

            <div className="str-video__call-controls__mobile">
              <ToggleMoreOptionsListButton />
            </div>
          </div>
          <div className="str-video__call-controls--group str-video__call-controls--media">
            <ToggleDualMicButton />
            <ToggleDualCameraButton />
            <div className="str-video__call-controls__desktop">
              <ToggleEffectsButton />
            </div>
            <div className="str-video__call-controls__desktop">
              <ToggleNoiseCancellationButton />
            </div>
            <div className="str-video__call-controls__desktop">
              <ToggleClosedCaptionsButton />
            </div>
            <div className="str-video__call-controls__desktop">
              <ReactionsButton />
            </div>
            <div className="str-video__call-controls__desktop">
              <ScreenShareButton />
            </div>

            <div className="str-video__call-controls__desktop">
              <IncomingVideoSettingsButton />
            </div>

            {isPipSupported && (
              <WithTooltip title={t("Pop out Picture-in-Picture")}>
                <CompositeButton
                  active={!!pipWindow}
                  variant="primary"
                  onClick={pipWindow ? closePipWindow : openPipWindow}
                >
                  <Icon icon="pip" />
                </CompositeButton>
              </WithTooltip>
            )}
            <RecordCallConfirmationButton />
            <div className="str-video__call-controls__desktop">
              <CancelCallConfirmButton onLeave={onLeave} />
            </div>
          </div>
          <div className="str-video__call-controls--group str-video__call-controls--sidebar">
            <div className="str-video__call-controls__desktop">
              <WithTooltip title={t("Closed Captions Queue")}>
                <CompositeButton
                  active={showClosedCaptions}
                  variant="primary"
                  onClick={() => {
                    setSidebarContent(
                      showClosedCaptions ? null : "closed-captions"
                    );
                  }}
                >
                  <Icon icon="closed-captions" />
                </CompositeButton>
              </WithTooltip>
            </div>

            <div className="str-video__call-controls__desktop">
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
            <NewMessageNotification
              chatClient={chatClient}
              channelWatched={channelWatched}
              disableOnChatOpen={showChat}
            >
              <div className="str-chat__chat-button__wrapper">
                <WithTooltip title={t("Chat")}>
                  <CompositeButton
                    active={showChat}
                    disabled={!chatClient}
                    onClick={() => {
                      setSidebarContent(showChat ? null : "chat");
                    }}
                  >
                    <Icon icon="chat" />
                  </CompositeButton>
                </WithTooltip>
                {!showChat && (
                  <UnreadCountBadge
                    channelWatched={channelWatched}
                    chatClient={chatClient}
                    channelId={activeCall.id}
                  />
                )}
              </div>
            </NewMessageNotification>
          </div>
        </div>
      </div>
    </div>
  );
};
