import { useCallback, useEffect, useState } from "react";
import {
  LivestreamLayout,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import {
  CallParticipantsScreenView,
  CallParticipantsView,
  SpeakerOneOnOne,
} from "@/screens/call/call-layout/index";

export const LayoutMap = {
  LegacyGrid: {
    Component: CallParticipantsView,
    title: "Default",
    icon: "grid",
    props: {},
  },
  PaginatedGrid: {
    Component: PaginatedGridLayout,
    title: "Grid",
    icon: "layout",
    props: {
      groupSize: 16,
    },
  },
  SpeakerBottom: {
    Component: SpeakerLayout,
    title: "Speaker [top]",
    icon: "layout-speaker-top",
    props: {
      participantsBarPosition: "bottom",
    },
  },
  SpeakerTop: {
    Component: SpeakerLayout,
    title: "Speaker [bottom]",
    icon: "layout-speaker-bottom",
    props: {
      participantsBarPosition: "top",
    },
  },
  SpeakerRight: {
    Component: SpeakerLayout,
    title: "Speaker [left]",
    icon: "layout-speaker-left",
    props: {
      participantsBarPosition: "right",
    },
  },
  SpeakerLeft: {
    Component: SpeakerLayout,
    title: "Speaker [right]",
    icon: "layout-speaker-right",
    props: {},
  },
  LegacySpeaker: {
    Component: CallParticipantsScreenView,
    icon: "layout",
    title: "Sidebar",
    props: {},
  },
  SpeakerOneOnOne: {
    Component: SpeakerOneOnOne,
    icon: "layout-speaker-one-on-one",
    title: "Speaker 1:1",
    props: {},
  },
  LivestreamLayout: {
    Component: LivestreamLayout,
    title: "Livestream",
    icon: "layout-speaker-live-stream",
    props: {},
  },
};

const SETTINGS_KEY = "@pronto/layout-settings";
const DEFAULT_LAYOUT: keyof typeof LayoutMap = "SpeakerBottom";

export const getLayoutSettings = () => {
  if (typeof window === "undefined") return;
  const settings = window.localStorage.getItem(SETTINGS_KEY);
  if (settings) {
    try {
      return JSON.parse(settings) as { selectedLayout: keyof typeof LayoutMap };
    } catch (e) {
      console.log("Error parsing layout settings", e);
    }
  }
};

export const useLayoutSwitcher = () => {
  const [layout, setLayout] = useState<keyof typeof LayoutMap>(() => {
    const storedLayout = getLayoutSettings()?.selectedLayout;
    if (!storedLayout) return DEFAULT_LAYOUT;
    return LayoutMap[storedLayout] ? storedLayout : DEFAULT_LAYOUT;
  });

  const { useHasOngoingScreenShare } = useCallStateHooks();
  const hasScreenShare = useHasOngoingScreenShare();
  useEffect(() => {
    // always switch to screen-share compatible layout
    if (hasScreenShare) {
      return setLayout((currentLayout) => {
        if (currentLayout.startsWith("Speaker")) return currentLayout;
        return "SpeakerBottom";
      });
    }

    const storedLayout = getLayoutSettings()?.selectedLayout ?? DEFAULT_LAYOUT;
    const isStoredLayoutInMap = LayoutMap[storedLayout];
    setLayout(
      // reset to "stored" layout, use default if incompatible layout is used
      storedLayout === "LegacySpeaker" || !isStoredLayoutInMap
        ? DEFAULT_LAYOUT
        : storedLayout
    );
  }, [hasScreenShare]);

  const switchLayout = useCallback((newLayout: keyof typeof LayoutMap) => {
    setLayout(newLayout);
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ selectedLayout: newLayout })
    );
  }, []);

  return {
    layout,
    setLayout: switchLayout,
  };
};
