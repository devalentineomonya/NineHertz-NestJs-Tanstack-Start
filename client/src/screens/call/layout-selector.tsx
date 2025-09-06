import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, Grid3X3 } from 'lucide-react';
import {
  Icon,
  useCallStateHooks,
  useMenuContext,
} from '@stream-io/video-react-sdk';
import { LayoutMap } from '@/hooks/use-layout-map';

export enum LayoutSelectorType {
  LIST = 'list',
  DROPDOWN = 'dropdown',
  SELECT = 'select',
}

export type LayoutSelectorProps = {
  onMenuItemClick: (newLayout: keyof typeof LayoutMap) => void;
  selectedLayout: keyof typeof LayoutMap;
  visualType?: LayoutSelectorType;
  className?: string;
};

export const LayoutSelector = ({
  onMenuItemClick: setLayout,
  selectedLayout,
  visualType = LayoutSelectorType.DROPDOWN,
  className,
}: LayoutSelectorProps) => {
  const { useHasOngoingScreenShare } = useCallStateHooks();
  const hasScreenShare = useHasOngoingScreenShare();

  const canScreenshare = (key: string) =>
    (hasScreenShare && (key === 'LegacyGrid' || key === 'PaginatedGrid')) ||
    (!hasScreenShare && key === 'LegacySpeaker');

  const availableLayouts = (Object.keys(LayoutMap) as Array<keyof typeof LayoutMap>)
    .filter((key) => !canScreenshare(key));

  const handleLayoutChange = useCallback(
    (layout: keyof typeof LayoutMap) => {
      setLayout(layout);
    },
    [setLayout]
  );

  if (visualType === LayoutSelectorType.LIST) {
    return (
      <ListMenu
        selectedLayout={selectedLayout}
        availableLayouts={availableLayouts}
        onLayoutChange={handleLayoutChange}
        className={className}
      />
    );
  }

  if (visualType === LayoutSelectorType.SELECT) {
    return (
      <SelectMenu
        selectedLayout={selectedLayout}
        availableLayouts={availableLayouts}
        onLayoutChange={handleLayoutChange}
        className={className}
      />
    );
  }

  return (
    <DropdownLayoutMenu
      selectedLayout={selectedLayout}
      availableLayouts={availableLayouts}
      onLayoutChange={handleLayoutChange}
      className={className}
    />
  );
};

type MenuComponentProps = {
  selectedLayout: keyof typeof LayoutMap;
  availableLayouts: Array<keyof typeof LayoutMap>;
  onLayoutChange: (layout: keyof typeof LayoutMap) => void;
  className?: string;
};

const ListMenu = ({
  selectedLayout,
  availableLayouts,
  onLayoutChange,
  className,
}: MenuComponentProps) => {
  const { close } = useMenuContext();

  return (
    <div className={cn('p-4 space-y-2', className)}>
      {availableLayouts.map((key) => (
        <Button
          key={key}
          variant={key === selectedLayout ? 'default' : 'ghost'}
          className={cn(
            'w-full justify-start gap-2 text-white',
            key === selectedLayout && 'bg-primary text-primary-foreground'
          )}
          onClick={() => {
            onLayoutChange(key);
            close?.();
          }}
        >
          <Icon className="h-4 w-4" icon={LayoutMap[key].icon} />
          {LayoutMap[key].title}
          {key === selectedLayout && <Check className="ml-auto h-4 w-4" />}
        </Button>
      ))}
    </div>
  );
};

const SelectMenu = ({
  selectedLayout,
  availableLayouts,
  onLayoutChange,
  className,
}: MenuComponentProps) => {
  return (
    <Select
      value={selectedLayout}
      onValueChange={(value) => onLayoutChange(value as keyof typeof LayoutMap)}
    >
      <SelectTrigger className={cn('w-[200px]', className)}>
        <div className="flex items-center gap-2">
          <Icon
            className="h-4 w-4"
            icon={LayoutMap[selectedLayout]?.icon || 'grid'}
          />
          <SelectValue placeholder="Select layout">
            {LayoutMap[selectedLayout]?.title}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {availableLayouts.map((key) => (
          <SelectItem key={key} value={key}>
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" icon={LayoutMap[key].icon} />
              {LayoutMap[key].title}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const DropdownLayoutMenu = ({
  selectedLayout,
  availableLayouts,
  onLayoutChange,
  className,
}: MenuComponentProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn('gap-2', className)}
        >
          <Icon
            className="h-4 w-4"
            icon={LayoutMap[selectedLayout]?.icon || 'grid'}
          />
          {LayoutMap[selectedLayout]?.title}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {availableLayouts.map((key) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onLayoutChange(key)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" icon={LayoutMap[key].icon} />
            {LayoutMap[key].title}
            {key === selectedLayout && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
