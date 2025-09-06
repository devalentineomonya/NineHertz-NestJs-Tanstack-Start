import {
  DefaultVideoPlaceholder,
  StreamVideoParticipant,
} from "@stream-io/video-react-sdk";

export const DisabledVideoPreview = () => {
  const mockParticipants: StreamVideoParticipant[] = [
    {
      userId: "R2-D2",
      name: "John Doe",
      isSpeaking: false,
      sessionId: "",
      publishedTracks: [],
      trackLookupPrefix: "",
      connectionQuality: "unknown" as any,
      isDominantSpeaker: false,
      audioLevel: 0,
      image: "",
      roles: [],
    },
  ];

  const session = {
    user: mockParticipants[0],
  };

  return (
    <DefaultVideoPlaceholder
      participant={session?.user as StreamVideoParticipant}
    />
  );
};
