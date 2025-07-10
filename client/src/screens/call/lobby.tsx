import { useLayoutSwitcher } from "@/hooks/use-layout-map";
import { cn } from "@/lib/utils";
import {
  Icon,
  ToggleAudioPreviewButton,
  ToggleVideoPreviewButton,
  useCall,
  useCallStateHooks,
  useConnectedUser,
  useI18n,
  VideoPreview,
} from "@stream-io/video-react-sdk";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DisabledVideoPreview } from "./disabled-video-preview";
import { ToggleSettingsTabModal } from "./settings/settings-tab-modal"
import { ToggleCameraButton } from "./toggle-camera-button";
import { ToggleEffectsButton } from "./toggle-effects-button";
import { ToggleMicButton } from "./toggle-mic-button";
import { ToggleParticipantsPreviewButton } from "./toggle-participants-preview";

export type UserMode = "regular" | "guest" | "anon";

export type LobbyProps = {
  onJoin: () => void;
  mode?: UserMode;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const Lobby = ({ onJoin, mode = "regular" }: LobbyProps) => {
  const call = useCall();

  const { useMicrophoneState, useCameraState, useCallSession, useCallMembers } =
    useCallStateHooks();
  const { hasBrowserPermission: hasMicPermission } = useMicrophoneState();
  const { hasBrowserPermission: hasCameraPermission, isMute: isCameraMute } =
    useCameraState();
  const callSession = useCallSession();
  const members = useCallMembers();
  const currentUser = useConnectedUser();

  const { t } = useI18n();

  const router = useRouter();

  const { layout, setLayout } = useLayoutSwitcher();

  useEffect(() => {
    const id = setTimeout(() => {
      onJoin();
    }, 500);
    return () => {
      clearTimeout(id);
    };
  }, [onJoin]);

  const [isRequestToJoinCallSent, setIsRequestToJoinCallSent] = useState(false);
  const isCurrentUserCallMember = members.some(
    (m) => m.user_id === currentUser?.id
  );

  const hasBrowserMediaPermission = hasCameraPermission && hasMicPermission;
  const hasOtherParticipants = callSession?.participants.length;
  return (
    <>
      <div className="rd__lobby bg-white h-96 w-96">
        <div className="rd__lobby-container">
          <div className="rd__lobby-content">
            {mode !== "anon" && (
              <>
                <h1 className="rd__lobby-heading">
                  {t("Set up your call before joining")}
                </h1>
                <p className="rd__lobby-heading__description">
                  {t(
                    "while our Edge Network is selecting the best server for your call..."
                  )}
                </p>
                <div
                  className={cn(
                    "rd__lobby-camera",
                    isCameraMute && "rd__lobby-camera--off"
                  )}
                >
                  <div className="rd__lobby-video-preview">
                    <VideoPreview
                      DisabledVideoPreview={
                        hasBrowserMediaPermission
                          ? DisabledVideoPreview
                          : AllowBrowserPermissions
                      }
                    />
                    <div className="rd__lobby-media-toggle">
                      <ToggleAudioPreviewButton Menu={null} />
                      <ToggleVideoPreviewButton Menu={null} />
                    </div>
                  </div>
                  <div className="rd__lobby-controls">
                    <div className="rd__lobby-media">
                      <ToggleMicButton />
                      <ToggleCameraButton />
                    </div>

                    <div className="rd__lobby-settings">
                      <ToggleParticipantsPreviewButton onJoin={onJoin} />
                      <ToggleEffectsButton inMeeting={false} />
                      <ToggleSettingsTabModal
                        layoutProps={{
                          selectedLayout: layout,
                          onMenuItemClick: setLayout,
                        }}
                        tabModalProps={{
                          inMeeting: false,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="rd__lobby-edge-network">
              <img
                src={`${
                  process.env.NEXT_PUBLIC_BASE_PATH || ""
                }/lock-person.svg`}
                alt="Stream logo"
                width={36}
                height={24}
              />
              <p className="rd__lobby-edge-network__description">
                You are about to {hasOtherParticipants ? "join" : "start "} a
                private test call via Stream. Once you{" "}
                {hasOtherParticipants ? "join" : "start "} the call, you can
                invite other participants.
              </p>
            </div>

            {call && call.type === "restricted" && !isCurrentUserCallMember ? (
              <button
                className={cn(
                  "rd__button rd__button--primary rd__button--large rd__lobby-join",
                  isRequestToJoinCallSent && "rd__button--disabled"
                )}
                type="button"
                data-testid="request-join-call-button"
                disabled={isRequestToJoinCallSent}
                onClick={async () => {
                  // TODO OL: replace with a call action
                  await call?.sendCustomEvent({
                    type: "pronto.request-to-join-call",
                  });
                  setIsRequestToJoinCallSent(true);
                }}
              >
                <Icon className="rd__button__icon" icon="login" />
                Request to join
              </button>
            ) : (
              <button
                className="rd__button rd__button--primary rd__button--large rd__lobby-join"
                type="button"
                data-testid="join-call-button"
                onClick={onJoin}
              >
                <Icon className="rd__button__icon" icon="login" />
                {hasOtherParticipants ? t("Join") : t("Start call")}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const AllowBrowserPermissions = () => {
  return (
    <p className="rd__lobby__no-permission">
      Please grant your browser a permission to access your camera and
      microphone.
    </p>
  );
};
