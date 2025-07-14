import {
  DropDownSelect,
  DropDownSelectOption,
  useI18n,
} from '@stream-io/video-react-sdk';
import { DeviceSelectionPreference } from "@/hooks/use-device-preference-selection"
import { useSettings } from '@/screens/call/context/settings-context';

const deviceSelectionOptions: DeviceSelectionPreference[] = [
  'system',
  'recent',
];

export const DeviceSelectionSettingsDropdown = ({
  title,
}: {
  title: string;
}) => {
  const { t } = useI18n();
  const {
    settings: {
      deviceSelectionPreference: currentSetting,
      setDeviceSelectionPreference: setCurrentSetting,
    },
  } = useSettings();
  const currentIndex = deviceSelectionOptions.indexOf(currentSetting);

  const handleChange = (index: number) => {
    const nextSetting = deviceSelectionOptions[index];
    setCurrentSetting(nextSetting);
  };

  return (
    <div className="mb-4">
      <div className="text-sm font-medium text-gray-700 mb-1.5">
        {title}
      </div>
      <DropDownSelect
        defaultSelectedIndex={currentIndex}
        defaultSelectedLabel={t(`device-selection/${currentSetting}`)}
        handleSelect={handleChange}
        // className="w-full rounded-md border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-3 text-sm text-gray-700"
      >
        {deviceSelectionOptions.map((value) => (
          <DropDownSelectOption
            key={value}
            label={t(`device-selection/${value}`)}
            selected={value === currentSetting}
            // className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            // selectedClassName="bg-blue-50 text-blue-600"
          />
        ))}
      </DropDownSelect>
    </div>
  );
};
