import { useEffect, useRef, useState } from "react";
import { useParams, createFileRoute } from "@tanstack/react-router";
import {
  StreamCall,
  StreamTheme,
  LoadingIndicator,
  BackgroundFiltersProvider,
  NoiseCancellationProvider,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import type { INoiseCancellation } from "@stream-io/audio-filters-web";
import Alert from "@/screens/call/alert";
import { MeetingSetup } from "@/screens/call/meet-setup";
import { MeetingRoom } from "@/screens/call/meeting-room";
import { useUserSessionStore } from "@/stores/user-session-store";
import { useSettings } from "@/screens/call/context/settings-context";
import { StreamVideoProvider } from "@/providers/stream-client-provider";

export const Route = createFileRoute("/(call)/call/join/$callId")({
  component: CallRoom,
});

function CallRoom() {
  const client = useStreamVideoClient();
  const { callId } = useParams({ from: "/(call)/call/join/$callId" });
  const { getCurrentUser } = useUserSessionStore();
  const { settings } = useSettings();
  const [call, setCall] = useState<any>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [noiseCancellation, setNoiseCancellation] =
    useState<INoiseCancellation | null>(null);
  const ncLoader = useRef<Promise<void> | undefined>(undefined);

  const [callError, setCallError] = useState<Error | null>(null);

  useEffect(() => {
    if (!client || !callId) return;

    const newCall = client.call("default", callId);
    setCall(newCall);

    newCall.join({ create: true }).catch((err) => {
      console.error("Failed to join call", err);
      setCallError(err);
    });

    return () => {
      if (newCall.state.callingState !== "left") {
        newCall.leave().catch(console.error);
      }
    };
  }, [client, callId]);

  useEffect(() => {
    const loadNoiseCancellation = async () => {
      try {
        const { NoiseCancellation } = await import(
          "@stream-io/audio-filters-web"
        );
        setNoiseCancellation(new NoiseCancellation());
      } catch (error) {
        console.error("Failed to load noise cancellation", error);
      }
    };

    const load = ncLoader.current || Promise.resolve();
    ncLoader.current = load.then(loadNoiseCancellation);

    return () => {
      ncLoader.current = load.then(() => setNoiseCancellation(null));
    };
  }, []);

  if (!client) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingIndicator className="text-foreground h-40 w-40 animate-spin" />
      </div>
    );
  }

  if (callError) {
    return <Alert title={callError.message} />;
  }

  if (!call) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingIndicator className="text-foreground h-40 w-40 animate-spin" />
      </div>
    );
  }

  // const notAllowed =
  //   call.type === "invited" &&
  //   (!user || !call.state.members.find((m) => m.user.id === user.id));

  // if (notAllowed) {
  //   return <Alert title="You are not allowed to join this meeting" />;
  // }

  return (
    <main className="h-screen w-full px-6 bg-black pt-1">
      <StreamCall call={call}>
        <StreamTheme className="bg-black" lang={settings.language}>
          <BackgroundFiltersProvider
            basePath="/tf"
            backgroundImages={[
              "/backgrounds/amsterdam-1.jpg",
              "/backgrounds/amsterdam-2.jpg",
              "/backgrounds/boulder-1.jpg",
              "/backgrounds/boulder-2.jpg",
              "/backgrounds/gradient-1.jpg",
              "/backgrounds/gradient-2.jpg",
              "/backgrounds/gradient-3.jpg",
            ]}
          >
            {noiseCancellation && (
              <NoiseCancellationProvider noiseCancellation={noiseCancellation}>
                {!isSetupComplete ? (
                  <div className="grid place-content-center  h-[70dvh]">
                    <MeetingSetup onJoin={() => setIsSetupComplete(true)} />
                  </div>
                ) : (
                  <MeetingRoom
                    activeCall={call}
                    onLeave={() => call.leave().catch(console.error)}
                    onJoin={() =>
                      call.join({ create: true }).catch(console.error)
                    }
                  />
                )}
              </NoiseCancellationProvider>
            )}
          </BackgroundFiltersProvider>
        </StreamTheme>
      </StreamCall>
    </main>
  );
}
