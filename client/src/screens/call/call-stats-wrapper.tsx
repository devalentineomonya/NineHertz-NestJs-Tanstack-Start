import {
  CallStats,
  CompositeButton,
  Icon,
  useI18n,
  WithTooltip,
} from '@stream-io/video-react-sdk';

export const ToggleStatsButton = (props: {
  active?: boolean;
  onClick?: () => void;
}) => {
  const { active, onClick } = props;
  const { t } = useI18n();
  return (
    <WithTooltip title={t('Stats')}>
      <CompositeButton
        active={active}
        variant="primary"
        title="Stats"
        onClick={onClick}
      >
        <Icon icon="stats" />
      </CompositeButton>
    </WithTooltip>
  );
};

export const CallStatsSidebar = () => {
  return (
    <div className='relative h-full max-h-[calc(100dvh-175px)] overflow-y-scroll text-white'>
      <CallStats showCodecInfo />
    </div>
  );
};
