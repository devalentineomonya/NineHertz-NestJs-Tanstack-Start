import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const RoomCardSkeleton = () => {
  return (
    <div className="w-full max-w-4xl">
      <Card className="relative overflow-hidden border-0 rounded-xl shadow-lg">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-l from-green-400/20 to-transparent rounded-bl-full"></div>

        <div className="relative z-10">
          {/* Header Section */}
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-5 w-5 rounded bg-green-200 dark:bg-green-700" />
                  <Skeleton className="h-5 w-48 bg-green-200 dark:bg-green-700" />
                </div>
                <Skeleton className="h-4 w-64 bg-green-200 dark:bg-green-700" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full bg-green-200 dark:bg-green-700" />
            </div>
          </CardHeader>

          <CardContent className="py-3">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Doctor & Patient Info Section */}
              <div className="lg:col-span-2 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Doctor Info Skeleton */}
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-green-100 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                      <Skeleton className="w-10 h-10 rounded-full bg-green-200 dark:bg-green-700" />
                      <div className="ml-2 flex-1 space-y-1">
                        <Skeleton className="h-4 w-32 bg-green-200 dark:bg-green-700" />
                        <Skeleton className="h-3 w-24 bg-green-200 dark:bg-green-700" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-28 bg-green-200 dark:bg-green-700" />
                      <Skeleton className="h-3 w-32 bg-green-200 dark:bg-green-700" />
                    </div>
                  </div>

                  {/* Patient Info Skeleton */}
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-emerald-100 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                      <Skeleton className="w-10 h-10 rounded-full bg-emerald-200 dark:bg-emerald-700" />
                      <div className="ml-2 flex-1 space-y-1">
                        <Skeleton className="h-4 w-28 bg-emerald-200 dark:bg-emerald-700" />
                        <Skeleton className="h-3 w-16 bg-emerald-200 dark:bg-emerald-700" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-32 bg-emerald-200 dark:bg-emerald-700" />
                      <Skeleton className="h-3 w-28 bg-emerald-200 dark:bg-emerald-700" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Timer Section */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-lg shadow-sm text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Skeleton className="h-4 w-4 mr-1 bg-white/30 rounded" />
                    <Skeleton className="h-4 w-24 bg-white/30" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16 mx-auto bg-white/30" />
                    <Skeleton className="h-6 w-28 mx-auto bg-white/30 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          {/* Footer Actions */}
          <CardFooter className="pt-3 pb-4">
            <div className="w-full">
              {/* Status Message Skeleton */}
              <div className="mb-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-center">
                <Skeleton className="h-4 w-48 mx-auto bg-yellow-200 dark:bg-yellow-700" />
              </div>

              {/* Action Buttons Skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                <Skeleton className="h-8 w-full bg-green-200 dark:bg-green-700 rounded-md" />
                <Skeleton className="h-8 w-full bg-green-200 dark:bg-green-700 rounded-md" />
                <Skeleton className="h-8 w-full bg-green-200 dark:bg-green-700 rounded-md" />
                <Skeleton className="h-8 w-full bg-green-200 dark:bg-green-700 rounded-md" />
              </div>
            </div>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
};

export default RoomCardSkeleton;
