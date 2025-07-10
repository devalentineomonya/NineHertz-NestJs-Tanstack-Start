import { ComponentType, useEffect, useState } from 'react';
import {
  DefaultParticipantViewUI,
  hasScreenShare,
  IconButton,
  ParticipantView,
  useCall,
  useCallStateHooks,
  useVerticalScrollPosition,
  Video,
} from '@stream-io/video-react-sdk';

export const CallParticipantsScreenView = (props: {
  ParticipantViewUI?: ComponentType;
}) => {
  const { ParticipantViewUI } = props;
  const call = useCall();
  const { useLocalParticipant, useParticipants } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const allParticipants = useParticipants();
  const firstScreenSharingParticipant = allParticipants.find((p) =>
    hasScreenShare(p),
  );

  const [scrollWrapper, setScrollWrapper] = useState<HTMLDivElement | null>(
    null,
  );

  useEffect(() => {
    if (!scrollWrapper || !call) return;
    const cleanup = call.setViewport(scrollWrapper);
    return () => cleanup();
  }, [scrollWrapper, call]);

  const scrollUpClickHandler = () => {
    scrollWrapper?.scrollBy({ top: -150, behavior: 'smooth' });
  };

  const scrollDownClickHandler = () => {
    scrollWrapper?.scrollBy({ top: 150, behavior: 'smooth' });
  };

  const scrollPosition = useVerticalScrollPosition(scrollWrapper);

  const [overlayVisible, setOverlayVisible] = useState(
    () =>
      firstScreenSharingParticipant?.sessionId === localParticipant?.sessionId,
  );

  return (
    <div className="flex h-full gap-2.5 bg-background text-foreground">
      <div className="flex flex-col justify-center flex-4 h-full gap-2 p-1.5">
        {firstScreenSharingParticipant && (
          <>
            <span className="py-2.5 pl-2.5 bg-muted rounded-sm text-muted-foreground">
              {firstScreenSharingParticipant.name ||
                firstScreenSharingParticipant.userId}{' '}
              is presenting their screen.
            </span>
            <div className="relative flex items-center justify-center flex-1 min-w-0 min-h-0">
              <Video
                className="object-contain w-full h-full"
                participant={firstScreenSharingParticipant}
                trackType="screenShareTrack"
                autoPlay
                muted
              />
              {overlayVisible && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 bg-black/80 text-white">
                  <div className="text-center">
                    <p className="mb-2">
                      To avoid an infinity mirror, don't share your entire
                      screen or browser window.
                    </p>
                    <p>
                      Share just a single tab or a different window instead.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setOverlayVisible(false)}
                  >
                    Got it
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <div className="relative flex flex-col items-center flex-1">
        {scrollPosition && scrollPosition !== 'top' && (
          <IconButton
            onClick={scrollUpClickHandler}
            icon="caret-up"
            className="absolute top-2 z-10 bg-background/80 rounded-full shadow-md p-1.5"
          />
        )}
        <div
          ref={setScrollWrapper}
          className="flex-1 w-full overflow-y-auto scrollbar-hide"
        >
          <div className="flex flex-col justify-center gap-4">
            {allParticipants.map((participant) => (
              <ParticipantView
                key={participant.sessionId}
                participant={participant}
                ParticipantViewUI={
                  ParticipantViewUI || DefaultParticipantViewUI
                }
              />
            ))}
          </div>
        </div>
        {scrollPosition && scrollPosition !== 'bottom' && (
          <IconButton
            onClick={scrollDownClickHandler}
            icon="caret-down"
            className="absolute bottom-2 z-10 bg-background/80 rounded-full shadow-md p-1.5"
          />
        )}
      </div>
    </div>
  );
};
