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

  if (
    selectedLayout === "LegacyGrid" ||
    (selectedLayout === "LegacySpeaker" && props)
  ) {
    return (
      <div className="flex-1 min-h-0 ">
        <SelectedComponent
          {...props}
          participantsBarPosition={
            "participantsBarPosition" in props &&
            (props.participantsBarPosition === "bottom" ||
              props.participantsBarPosition === "top" ||
              props.participantsBarPosition === "right" ||
              props.participantsBarPosition === "left")
              ? props.participantsBarPosition
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <SelectedComponent
      {...props}
      groupSize={
        !groupSize || groupSize > 16
          ? "groupSize" in props
            ? props.groupSize
            : groupSize
          : groupSize
      }
      participantsBarPosition={
        "participantsBarPosition" in props &&
        (props.participantsBarPosition === "bottom" ||
          props.participantsBarPosition === "top" ||
          props.participantsBarPosition === "right" ||
          props.participantsBarPosition === "left")
          ? props.participantsBarPosition
          : undefined
      }
    />
  );
};
