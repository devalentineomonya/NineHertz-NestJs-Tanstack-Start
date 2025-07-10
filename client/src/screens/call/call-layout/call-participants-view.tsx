import { ComponentType } from "react";
import {
  DefaultParticipantViewUI,
  ParticipantView,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

const getGridClasses = (count: number) => {
  if (count <= 0) return "grid-cols-1";
  if (count === 1) return "grid-cols-1 grid-rows-1";
  if (count === 2) return "grid-cols-2 grid-rows-1";
  if (count <= 4) return "grid-cols-2 grid-rows-2";
  if (count <= 6) return "grid-cols-3 grid-rows-2";
  if (count <= 9) return "grid-cols-3 grid-rows-3";
  if (count <= 12)
    return count === 12
      ? "grid-cols-4 [grid-auto-rows:1fr]"
      : "grid-cols-4 grid-rows-3";
  return count <= 25
    ? "grid-cols-5 [grid-auto-rows:1fr]"
    : "grid-cols-6 [grid-auto-rows:1fr]";
};

export const CallParticipantsView = ({
  ParticipantViewUI,
}: {
  ParticipantViewUI?: ComponentType;
}) => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const count = participants.length || 1;

  return (
    <div
      className={`grid gap-2.5 items-center justify-center h-full min-h-0 ${getGridClasses(
        count
      )}`}
    >
      {participants.map((participant) => (
        <ParticipantView
          key={participant.sessionId}
          participant={participant}
          ParticipantViewUI={ParticipantViewUI || DefaultParticipantViewUI}
        />
      ))}
    </div>
  );
};
