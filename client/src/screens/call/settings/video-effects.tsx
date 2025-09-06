import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Droplet, Image as ImageIcon, AlertTriangle } from "lucide-react";
import {
  Icon,
  useBackgroundFilters,
  VideoPreview,
} from "@stream-io/video-react-sdk";

export const VideoEffectsSettings = () => {
  const {
    isSupported,
    backgroundImages,
    backgroundBlurLevel,
    backgroundImage,
    backgroundFilter,
    disableBackgroundFilter,
    applyBackgroundBlurFilter,
    applyBackgroundImageFilter,
  } = useBackgroundFilters();

  if (!isSupported) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          <CardTitle className="text-lg">Unsupported Browser</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            Video filters are available only on modern desktop browsers
          </p>
        </CardContent>
      </Card>
    );
  }

  const blurOptions = [
    { level: "high", label: "High Blur", intensity: "high" },
    { level: "medium", label: "Medium Blur", intensity: "medium" },
    { level: "low", label: "Low Blur", intensity: "low" },
  ] as const;

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      {/* Video Preview */}
      <Card>
        <CardContent className="p-4">
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
            <VideoPreview />
          </div>
        </CardContent>
      </Card>

      {/* Effects Controls */}
      <div className="grid gap-4">
        {/* Blur Effects */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Droplet className="h-4 w-4" />
              Effects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Disable Filter */}
              <Button
                variant={!backgroundFilter ? "default" : "outline"}
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-3"
                onClick={() => disableBackgroundFilter()}
              >
                <X className="h-4 w-4" />
                <span className="text-xs">Disable</span>
                {!backgroundFilter && (
                  <Badge variant="secondary" className="text-xs px-1">
                    Active
                  </Badge>
                )}
              </Button>

              {/* Blur Options */}
              {blurOptions.map(({ level, label, intensity }) => (
                <Button
                  key={level}
                  variant={
                    backgroundFilter === "blur" && backgroundBlurLevel === level
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="flex flex-col items-center gap-1 h-auto py-3"
                  onClick={() => applyBackgroundBlurFilter(level)}
                >
                  <Icon
                    icon="blur-icon"
                    className={cn(
                      "h-4 w-4",
                      intensity === "medium" && "opacity-70",
                      intensity === "low" && "opacity-50"
                    )}
                  />
                  <span className="text-xs">{label}</span>
                  {backgroundFilter === "blur" &&
                    backgroundBlurLevel === level && (
                      <Badge variant="secondary" className="text-xs px-1">
                        Active
                      </Badge>
                    )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Background Images */}
        {backgroundImages && backgroundImages.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Backgrounds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {backgroundImages.map((imageUrl) => {
                  const isActive =
                    backgroundFilter === "image" &&
                    backgroundImage === imageUrl;

                  return (
                    <div key={imageUrl} className="relative group">
                      <button
                        className={cn(
                          "w-full aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200",
                          "hover:scale-105 hover:shadow-md",
                          isActive
                            ? "border-primary ring-2 ring-primary ring-offset-2"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => applyBackgroundImageFilter(imageUrl)}
                      >
                        <img
                          src={imageUrl}
                          alt="Background option"
                          className="w-full h-full object-cover"
                        />
                        {isActive && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <Badge variant="default" className="text-xs">
                              Active
                            </Badge>
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
