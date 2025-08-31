import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams, createFileRoute, useRouter } from "@tanstack/react-router";
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
  const router = useRouter();

  // Add refs to prevent multiple initializations
  const videoClientInitialized = useRef(false);
  const callInitialized = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const {
    data,
    error: tokenError,
    isLoading: tokenLoading,
    refetch: refetchToken,
  } = useGetUserToken(callId);
  const token = data?.token;

  // Memoize the setup complete handler to prevent unnecessary re-renders
  const handleSetupComplete = useCallback(() => {
    setIsSetupComplete(true);
  }, []);

  // Initialize video client only once
  useEffect(() => {
    if (!token || !user || videoClientInitialized.current) return;

    videoClientInitialized.current = true;

    const client = new StreamVideoClient({
      apiKey: import.meta.env.VITE_STREAM_API_KEY,
      user: {
        id: user.id,
        name: user.fullName || "",
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

    // Store cleanup function
    cleanupRef.current = () => {
      client.disconnectUser();
    };

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      videoClientInitialized.current = false;
    };
  }, [token, user?.id, user?.fullName]); // Use specific user properties instead of entire user object

  // Initialize call only once
  useEffect(() => {
    if (!videoClient || !callId || !token || callInitialized.current) return;

    callInitialized.current = true;

    const newCall = videoClient.call("default", callId);
    setCall(newCall);

    // Join call with proper error handling
    const joinCall = async () => {
      try {
        await newCall.join({ create: true });
        setJoinError(null);
      } catch (err) {
        console.error("Failed to join call", err);
        setJoinError(err as Error);
      }
    };

    joinCall();

    return () => {
      const cleanup = async () => {
        try {
          if (newCall.state.callingState !== "left") {
            await newCall.leave();
          }
        } catch (error) {
          console.error("Error leaving call:", error);
        }
      };
      cleanup();
      callInitialized.current = false;
    };
  }, [videoClient, callId, token]);

  // Load noise cancellation only once
  useEffect(() => {
    if (ncLoader.current) return;

    const loadNoiseCancellation = async () => {
      try {
        const { NoiseCancellation } = await import(
          "@stream-io/audio-filters-web"
        );
        setNoiseCancellation(new NoiseCancellation());
      } catch (error) {
        console.error("Failed to load noise cancellation", error);
        setNoiseCancellation(null);
      }
    };

    ncLoader.current = loadNoiseCancellation();

    return () => {
      // Cleanup noise cancellation
      setNoiseCancellation(null);
    };
  }, []);

  // Memoize error handling to prevent re-renders
  const errorMessage = useMemo(() => {
    const error = tokenError || joinError;
    if (!error) return null;

    let message = error?.message ?? "An Error occurred";

    if (message.includes("TokenExpired") || message.includes("InvalidToken")) {
      return "Session expired. Please try to reconnect.";
    }

    if (message.includes("appointment is not currently active")) {
      return "The appointment is not active right now. Please check the appointment time.";
    }

    if (message.includes("appointment has been cancelled")) {
      return "This appointment has been cancelled.";
    }

    if (message.includes("not a virtual meeting")) {
      return "This is not a virtual appointment.";
    }

    return message;
  }, [tokenError, joinError]);

  if (errorMessage) {
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
                      <MeetingSetup onJoin={handleSetupComplete} />
                    </div>
                  ) : (
                    <MeetingRoom
                      activeCall={call}
                      onLeave={() =>
                        router.navigate({
                          to: `/${user?.role as "doctor" | "patient"}/rooms`,
                        })
                      }
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
