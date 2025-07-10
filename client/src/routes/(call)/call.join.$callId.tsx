import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  StreamCall,
  useStreamVideoClient,
  LoadingIndicator,
  BackgroundFiltersProvider,
  NoiseCancellationProvider,
  StreamVideo,

} from "@stream-io/video-react-sdk";
import type { INoiseCancellation } from '@stream-io/audio-filters-web';

import { MeetingUI } from "@/screens/call/meeting-ui";


import { useSettings } from "@/screens/call/context/settings-context";

export const Route = createFileRoute("/(call)/call/join/$callId")({
  component: CallRoom,
});

function CallRoom() {
  const { callId } = Route.useParams();
  const { settings } = useSettings();
  const videoClient = useStreamVideoClient();
  const [call, setCall] = useState<any>(null);
  const [noiseCancellation, setNoiseCancellation] = useState<INoiseCancellation | null>(null);
  const ncLoader = useRef<Promise<void> | undefined>(undefined);

  // Initialize call
  useEffect(() => {
    if (!videoClient) return;

    const newCall = videoClient.call("default", callId);
    setCall(newCall);

    // Join the call
    newCall.getOrCreate().catch((err) => {
      console.error("Failed to join call", err);
    });

    return () => {
      if (newCall.state.callingState !== 'left') {
        newCall.leave().catch((e) => console.error("Failed to leave call", e));
      }
    };
  }, [videoClient, callId]);

  // Load noise cancellation
  useEffect(() => {
    const loadNoiseCancellation = async () => {
      try {
        const { NoiseCancellation } = await import('@stream-io/audio-filters-web');
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

  if (!videoClient || !call) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <LoadingIndicator className="text-blue-500 h-40 w-40 animate-spin" />
      </div>
    );
  }

  return (
    <StreamVideo
      client={videoClient}
      language={settings.language}
      fallbackLanguage={settings.fallbackLanguage}
    >
      <StreamCall call={call}>

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
                <MeetingUI />
              </NoiseCancellationProvider>
            )}
            {!noiseCancellation && (

                <MeetingUI />

            )}
          </BackgroundFiltersProvider>

      </StreamCall>
    </StreamVideo>
  );
}
