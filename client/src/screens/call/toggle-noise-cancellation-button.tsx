import {
  CompositeButton,
  WithTooltip,
  useNoiseCancellation,
} from "@stream-io/video-react-sdk";
import { Ear, EarOff } from "lucide-react";

export const ToggleNoiseCancellationButton = () => {
  const { isSupported, isEnabled, setEnabled } = useNoiseCancellation();
  if (!isSupported) return null;
  return (
    <WithTooltip
      title={`Noise cancellation is ${isEnabled ? "active" : "inactive"}`}
    >
      <CompositeButton onClick={() => setEnabled((v) => !v)} variant="primary">
        {isEnabled ? <Ear className="size-4" /> : <EarOff className="size-4" />}
      </CompositeButton>
    </WithTooltip>
  );
};
