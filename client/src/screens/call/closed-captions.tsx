import {
  CompositeButton,
  OwnCapability,
  useCall,
  useCallStateHooks,
  WithTooltip,
} from "@stream-io/video-react-sdk";
import { ClosedCaptionIcon } from "./closed-caption-icon";

export const ToggleClosedCaptionsButton = () => {
  const call = useCall();
  const { useIsCallCaptioningInProgress, useHasPermissions } =
    useCallStateHooks();
  const isCaptioned = useIsCallCaptioningInProgress();
  const canToggle = useHasPermissions(
    OwnCapability.START_CLOSED_CAPTIONS_CALL,
    OwnCapability.STOP_CLOSED_CAPTIONS_CALL
  );
  return (
    <WithTooltip title="Toggle closed captions">
      <CompositeButton
        active={isCaptioned}
        disabled={!canToggle}
        variant="primary"
        onClick={async () => {
          if (!call) return;
          try {
            if (isCaptioned) {
              await call.stopClosedCaptions();
            } else {
              await call.startClosedCaptions();
            }
          } catch (e) {
            console.error("Failed to toggle closed captions", e);
          }
        }}
      >
        <ClosedCaptionIcon/>
      </CompositeButton>
    </WithTooltip>
  );
};
