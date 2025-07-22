import { useEffect, useRef, useState } from "react";
import { useParams, createFileRoute } from "@tanstack/react-router";
import {
  StreamCall,
  StreamTheme,
  LoadingIndicator,
  BackgroundFiltersProvider,
  NoiseCancellationProvider,
  StreamVideo,
  StreamVideoClient, 
} from "@stream-io/video-react-sdk";
import type { INoiseCancellation } from "@stream-io/audio-filters-web";
import Alert from "@/screens/call/alert";
import { MeetingSetup } from "@/screens/call/meet-setup";
import { MeetingRoom } from "@/screens/call/meeting-room";
import { useUserSessionStore } from "@/stores/user-session-store";
import { useSettings } from "@/screens/call/context/settings-context";
import { useGetUserToken } from "@/services/appointments/use-get-user-token";

export const Route = createFileRoute("/(call)/call/join/$callId")({
  component: CallRoom,
});

function CallRoom() {
  const { callId } = useParams({ from: "/(call)/call/join/$callId" });
  const { getCurrentUser } = useUserSessionStore();
  const user = getCurrentUser();
  const { settings } = useSettings();
  const [call, setCall] = useState<any>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [noiseCancellation, setNoiseCancellation] =
    useState<INoiseCancellation | null>(null);
  const ncLoader = useRef<Promise<void> | undefined>(undefined);
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(
    null
  );
  const [joinError, setJoinError] = useState<Error | null>(null);

  const {
    data,
    error: tokenError,
    isLoading: tokenLoading,
    refetch: refetchToken,
  } = useGetUserToken(callId);
  const token = data?.token;

  useEffect(() => {
    if (!token || !user) return;

    const client = new StreamVideoClient({
      apiKey: import.meta.env.VITE_STREAM_API_KEY,
      user: {
        id: user.id,
        name: user.name || "",
      },
      token,
      options: {
        maxConnectUserRetries: 3,
        onConnectUserError: (err: Error, allErrors: Error[]) => {
          console.error("Failed to connect user", err, allErrors);
          setJoinError(err);
        },
      },
    });

    setVideoClient(client);

    return () => {
      client.disconnectUser();
    };
  }, [token, user]);

  useEffect(() => {
    if (!videoClient || !callId || !token) return;

    const newCall = videoClient.call("default", callId);
    setCall(newCall);

    newCall
      .join({ create: true })
      .then(() => setJoinError(null))
      .catch((err) => {
        console.error("Failed to join call", err);
        setJoinError(err);
      });

    return () => {
      if (newCall.state.callingState !== "left") {
        newCall.leave().catch(console.error);
      }
    };
  }, [videoClient, callId, token]);

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

  if (tokenError || joinError) {
    const error = tokenError || joinError;
    let errorMessage = error?.message ?? "An Error occurred";

    if (
      errorMessage.includes("TokenExpired") ||
      errorMessage.includes("InvalidToken")
    ) {
      errorMessage = "Session expired. Please try to reconnect.";
    }

    if (errorMessage.includes("appointment is not currently active")) {
      errorMessage =
        "The appointment is not active right now. Please check the appointment time.";
    }

    if (errorMessage.includes("appointment has been cancelled")) {
      errorMessage = "This appointment has been cancelled.";
    }

    if (errorMessage.includes("not a virtual meeting")) {
      errorMessage = "This is not a virtual appointment.";
    }

    return <Alert title={errorMessage} />;
  }

  // Show loading state while initializing
  if (tokenLoading || !token || !videoClient || !call) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <LoadingIndicator className="text-foreground h-40 w-40 animate-spin" />
        <p className="mt-4 text-lg text-gray-500">
          Setting up your video session...
        </p>
      </div>
    );
  }

  return (
    <main className="h-screen w-full px-6 bg-black pt-1">
      {/* Wrap everything in StreamVideo provider */}
      <StreamVideo client={videoClient}>
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
              {noiseCancellation ? (
                <NoiseCancellationProvider
                  noiseCancellation={noiseCancellation}
                >
                  {!isSetupComplete ? (
                    <div className="grid place-content-center h-[70dvh]">
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
              ) : (
                <div className="flex items-center justify-center h-full">
                  <LoadingIndicator />
                </div>
              )}
            </BackgroundFiltersProvider>
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
    </main>
  );
}
