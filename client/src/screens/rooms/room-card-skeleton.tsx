import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

const RoomCardSkeleton = () => {
  return (
    <div className="max-w-2xl w-full">
      <Card className="relative overflow-hidden border-0 rounded-2xl">
        {/* Decorative elements (skeleton version) */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 dark:bg-green-800 rounded-bl-full opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-200 dark:bg-green-700 rounded-tr-full opacity-10"></div>

        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48 bg-green-200 dark:bg-green-700" />
              <Skeleton className="h-4 w-64 bg-green-200 dark:bg-green-700" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full bg-green-200 dark:bg-green-700" />
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <div className="space-y-6">
            {/* Doctor Info Skeleton */}
            <div className="bg-white dark:bg-green-800 p-4 rounded-xl shadow-sm">
              <div className="flex items-center mb-3">
                <Skeleton className="w-12 h-12 rounded-full bg-green-200 dark:bg-green-700" />
                <div className="ml-3 space-y-2">
                  <Skeleton className="h-4 w-32 bg-green-200 dark:bg-green-700" />
                  <Skeleton className="h-3 w-24 bg-green-200 dark:bg-green-700" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-40 bg-green-200 dark:bg-green-700" />
                <Skeleton className="h-3 w-36 bg-green-200 dark:bg-green-700" />
              </div>
            </div>

            {/* Patient Info Skeleton */}
            <div className="bg-white dark:bg-green-800 p-4 rounded-xl shadow-sm">
              <div className="flex items-center mb-3">
                <Skeleton className="w-12 h-12 rounded-full bg-green-200 dark:bg-green-700" />
                <div className="ml-3 space-y-2">
                  <Skeleton className="h-4 w-32 bg-green-200 dark:bg-green-700" />
                  <Skeleton className="h-3 w-24 bg-green-200 dark:bg-green-700" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-40 bg-green-200 dark:bg-green-700" />
                <Skeleton className="h-3 w-36 bg-green-200 dark:bg-green-700" />
              </div>
            </div>

            {/* Appointment Details Skeleton */}
            <div className="bg-green-200 dark:bg-green-700 p-4 rounded-xl">
              <div className="flex items-center mb-3">
                <Skeleton className="h-4 w-4 mr-2 bg-green-200 dark:bg-green-500" />
                <Skeleton className="h-4 w-32 bg-green-200 dark:bg-green-500" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-40 bg-green-200 dark:bg-green-500" />
                <Skeleton className="h-3 w-36 bg-green-200 dark:bg-green-500" />
                <Skeleton className="h-6 w-48 mt-2 bg-green-200 dark:bg-green-500" />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0 flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 w-full sm:w-32 bg-green-200 dark:bg-green-700" />
          <Skeleton className="h-10 w-full sm:w-40 bg-green-200 dark:bg-green-700" />
        </CardFooter>
      </Card>
    </div>
  );
};

export default RoomCardSkeleton;
