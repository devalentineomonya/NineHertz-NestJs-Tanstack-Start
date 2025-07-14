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
import { ToggleSettingsTabModal } from "./settings/settings-tab-modal";
import { ToggleCameraButton } from "./toggle-camera-button";
// import { ToggleEffectsButton } from "./toggle-effects-button";
import { ToggleMicButton } from "./toggle-mic-button";
import { ToggleParticipantsPreviewButton } from "./toggle-participants-preview";

export type UserMode = "regular" | "guest" | "anon";

export type MeetingSetupProps = {
  onJoin: () => void;
  mode?: UserMode;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const MeetingSetup = ({
  onJoin,
  mode = "regular",
}: MeetingSetupProps) => {
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
    return () => clearTimeout(id);
  }, [onJoin]);

  const [isRequestToJoinCallSent, setIsRequestToJoinCallSent] = useState(false);
  const isCurrentUserCallMember = members.some(
    (m) => m.user_id === currentUser?.id
  );
  const hasBrowserMediaPermission = hasCameraPermission && hasMicPermission;
  const hasOtherParticipants = callSession?.participants.length;

  return (
    <div className="flex flex-col items-center justify-center bg-[#101213] w-[500px] aspect-video rounded-xl shadow-lg p-6">
      <div className="w-full h-full flex flex-col">
        {mode !== "anon" && (
          <>

            <div
              className={cn(
                "flex flex-col items-center mb-6",
                isCameraMute && "opacity-75"
              )}
            >
              <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4 grid place-content-center">
                <VideoPreview
                className="w-[500px] aspect-video"
                  DisabledVideoPreview={
                    hasBrowserMediaPermission
                      ? DisabledVideoPreview
                      : AllowBrowserPermissions
                  }
                />
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 rounded-full p-1.5">
                  <ToggleAudioPreviewButton Menu={null} />
                  <ToggleVideoPreviewButton Menu={null} />
                </div>
              </div>

              <div className="flex flex-col items-center w-full">
                <div className="flex gap-4 mb-3">
                  <ToggleMicButton />
                  <ToggleCameraButton />
                </div>

                <div className="flex gap-3">
                  <ToggleParticipantsPreviewButton onJoin={onJoin} />
                  {/* <ToggleEffectsButton inMeeting={false} /> */}
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

        <div className="flex items-start gap-3 mb-6">
          <img
            src={`${basePath}/lock-person.svg`}
            alt="Secure call"
            width={36}
            height={24}
          />
          <p className="text-sm text-gray-600">
            You are about to {hasOtherParticipants ? "join" : "start"} a private
            test call via Stream. Once you{" "}
            {hasOtherParticipants ? "join" : "start"} the call, you can invite
            other participants.
          </p>
        </div>

        {call && call.type === "restricted" && !isCurrentUserCallMember ? (
          <button
            className={cn(
              "flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium",
              isRequestToJoinCallSent && "opacity-50 cursor-not-allowed"
            )}
            disabled={isRequestToJoinCallSent}
            onClick={async () => {
              await call?.sendCustomEvent({
                type: "pronto.request-to-join-call",
              });
              setIsRequestToJoinCallSent(true);
            }}
          >
            <Icon icon="login" />
            Request to join
          </button>
        ) : (
          <button
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            onClick={onJoin}
          >
            <Icon icon="login" />
            {hasOtherParticipants ? t("Join") : t("Start call")}
          </button>
        )}
      </div>
    </div>
  );
};

const AllowBrowserPermissions = () => (
  <div className="absolute inset-0 flex items-center justify-center p-4">
    <p className="text-sm text-center text-gray-700">
      Please grant your browser permission to access your camera and microphone.
    </p>
  </div>
);
