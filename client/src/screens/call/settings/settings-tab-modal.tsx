import { cn } from '@/lib/utils';
import { forwardRef, ReactElement, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';

import {
  CallStats,
  CompositeButton,
  DeviceSelectorAudioInput,
  DeviceSelectorAudioOutput,
  DeviceSelectorVideo,
  Icon,
  MenuToggle,
  MenuVisualType,
  ToggleMenuButtonProps,
  useI18n,
  useMenuContext,
  WithTooltip,
} from "@stream-io/video-react-sdk";

import { useLanguage } from "@/hooks/use-language";
import { LayoutSelector, LayoutSelectorProps } from "../layout-selector"
import { CallRecordings } from "../call-recordings";
import { IncomingVideoSettingsDropdown } from "../incoming-video-settings";
import { DeviceSelectionSettingsDropdown } from "./device-selection";
import { LanguageMenu } from "./language-menu";
import { TranscriptionSettings } from "./transcriptions";
import { VideoEffectsSettings } from "./video-effects";

type ToggleSettingsTabModalProps = {
  inMeeting: boolean;
  activeTab?: number;
};

type SettingsTabModalProps = {
  activeTab?: number;
  children: ReactElement<TabWrapperProps> | ReactElement<TabWrapperProps>[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type TabWrapperProps = {
  icon: string;
  label: string;
  inMeeting?: boolean;
  hidden?: boolean;
  value?: string;
};

const SettingsTabModal = ({
  children,
  activeTab = 0,
  open,
  onOpenChange,
}: SettingsTabModalProps) => {
  const childArray = Array.isArray(children) ? children : [children];

  // Filter visible tabs
  const visibleTabs = childArray.filter(
    (child) => child && child.props.inMeeting && !child.props.hidden
  );

  // Get default active tab value
  const defaultValue = visibleTabs[activeTab]?.props.value || visibleTabs[0]?.props.value || 'devices';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl w-full h-[90vh] bg-gray-900 border-gray-700 text-white overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b border-gray-700 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-white">Settings</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 text-white hover:bg-gray-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue={defaultValue} className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 mb-6 bg-gray-800 border-gray-700">
              {visibleTabs.map((child, index) => (
                <TabsTrigger
                  key={child.props.value || index}
                  value={child.props.value || `tab-${index}`}
                  className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white hover:bg-gray-700 hover:text-white"
                >
                  <Icon className="h-4 w-4" icon={child.props.icon} />
                  <span className="hidden sm:inline">{child.props.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              {visibleTabs.map((child, index) => (
                <TabsContent
                  key={child.props.value || index}
                  value={child.props.value || `tab-${index}`}
                  className="mt-0 h-full"
                >
                  <div className="space-y-6 text-white">
                    {child}
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TabWrapper = ({ children, value, ...props }: React.PropsWithChildren<TabWrapperProps>) => {
  return <div className="space-y-4 text-white">{children}</div>;
};

export const SettingsTabModalMenu = (props: {
  tabModalProps: ToggleSettingsTabModalProps;
  layoutProps: LayoutSelectorProps;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { setLanguage } = useLanguage();
  const { t } = useI18n();
  const { tabModalProps, layoutProps, open, onOpenChange } = props;

  return (
    <SettingsTabModal {...tabModalProps} open={open} onOpenChange={onOpenChange}>
      <TabWrapper
        icon="device-settings"
        label={t("Device settings")}
        inMeeting
        value="devices"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3 text-white">{t("Select a Camera")}</h3>
            <DeviceSelectorVideo
              visualType="dropdown"
              title={t("Select a Camera")}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3 text-white">{t("Select a Mic")}</h3>
            <DeviceSelectorAudioInput
              visualType="dropdown"
              title={t("Select a Mic")}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3 text-white">{t("Select a Speaker")}</h3>
            <DeviceSelectorAudioOutput
              visualType="dropdown"
              title={t("Select a Speaker")}
            />
          </div>

          <Separator className="bg-gray-700" />

          <div>
            <h3 className="text-sm font-medium mb-3 text-white">{t("Incoming video quality")}</h3>
            <IncomingVideoSettingsDropdown title={t("Incoming video quality")} />
            <p className="text-xs text-gray-400 mt-2">
              Actual incoming video quality depends on a number of factors, such as
              the quality of the source video, and network conditions.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3 text-white">{t("Default device preference")}</h3>
            <DeviceSelectionSettingsDropdown
              title={t("Default device preference")}
            />
          </div>
        </div>
      </TabWrapper>

      <TabWrapper
        icon="video-effects"
        label="Effects"
        inMeeting
        value="effects"
      >
        <VideoEffectsSettings />
      </TabWrapper>

      <TabWrapper
        icon="grid"
        label={t("Layout")}
        inMeeting
        value="layout"
      >
        <div>
          <h3 className="text-sm font-medium mb-4 text-white">Choose your layout</h3>
          <LayoutSelector
            onMenuItemClick={layoutProps.onMenuItemClick}
            selectedLayout={layoutProps.selectedLayout}
          />
        </div>
      </TabWrapper>

      <TabWrapper
        icon="stats"
        label={t("Statistics")}
        inMeeting={tabModalProps.inMeeting}
        value="stats"
      >
        <div>
          <h3 className="text-sm font-medium mb-4 text-white">Call Statistics</h3>
          <CallStats />
        </div>
      </TabWrapper>

      <TabWrapper
        icon="transcriptions"
        label="Transcriptions"
        inMeeting
        value="transcriptions"
      >
        <div>
          <h3 className="text-sm font-medium mb-4 text-white">Transcription Settings</h3>
          <TranscriptionSettings />
        </div>
      </TabWrapper>

      <TabWrapper
        icon="language"
        label={t("Language")}
        inMeeting
        value="language"
      >
        <div>
          <h3 className="text-sm font-medium mb-4 text-white">Select Language</h3>
          <LanguageMenu setLanguage={setLanguage} />
        </div>
      </TabWrapper>

      <TabWrapper
        icon="film-roll"
        label={t("Recording library")}
        inMeeting={tabModalProps.inMeeting}
        value="recordings"
      >
        <div>
          <h3 className="text-sm font-medium mb-4 text-white">Call Recordings</h3>
          <CallRecordings />
        </div>
      </TabWrapper>
    </SettingsTabModal>
  );
};

const ToggleSettingsMenuButton = forwardRef<
  HTMLDivElement,
  ToggleMenuButtonProps & { onClick: () => void }
>(function ToggleSettingsMenuButton(props, ref) {
  const { t } = useI18n();
  return (
    <WithTooltip title={t("Settings")}>
      <div ref={ref} onClick={props.onClick}>
        <CompositeButton active={props.menuShown} variant="primary">
          <Icon icon="device-settings" />
        </CompositeButton>
      </div>
    </WithTooltip>
  );
});

export const ToggleSettingsTabModal = (props: {
  tabModalProps: ToggleSettingsTabModalProps;
  layoutProps: LayoutSelectorProps;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ToggleSettingsMenuButton
        menuShown={open}
        onClick={() => setOpen(true)}
      />
      <SettingsTabModalMenu
        {...props}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
};
