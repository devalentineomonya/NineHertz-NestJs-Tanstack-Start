import { useQueryState } from "nuqs";
import { LayoutMap } from "@/hooks/use-layout-map";

export const Stage = ({
  selectedLayout,
}: {
  selectedLayout: keyof typeof LayoutMap;
}) => {
  const [groupSizeRaw] = useQueryState("group_size", {
    parse: Number,
    defaultValue: 0,
  });

  const groupSize = groupSizeRaw ?? 0;

  const SelectedComponent = LayoutMap[selectedLayout].Component;
  const props = LayoutMap[selectedLayout]?.props;

  if (selectedLayout === "LegacyGrid" || selectedLayout === "LegacySpeaker") {
    return (
      <div className="flex-1 min-h-0 ">
        <SelectedComponent {...props} />
      </div>
    );
  }

  return (
    <SelectedComponent
      {...props}
      groupSize={!groupSize || groupSize > 16 ? props?.groupSize : groupSize}
    />
  );
};
