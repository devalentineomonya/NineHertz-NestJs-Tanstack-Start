import { motion, Variant } from "framer-motion";

export function PatientDashboardSkeleton() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    } as Variant,
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    } as Variant,
  };

  // Skeleton item component
  const SkeletonItem = ({ className = "" }: { className?: string }) => (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-4 md:p-6 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <motion.div
          variants={itemVariants}
          className="flex justify-between items-center"
        >
          <div className="space-y-2">
            <SkeletonItem className="h-8 w-64" />
            <SkeletonItem className="h-4 w-48" />
          </div>
          <div className="flex space-x-3">
            <SkeletonItem className="h-10 w-10 rounded-full" />
            <SkeletonItem className="h-10 w-36 rounded-md" />
          </div>
        </motion.div>

        {/* Stats Cards Skeleton */}
        <motion.div variants={itemVariants} className="relative">
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl p-5"
              >
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <SkeletonItem className="h-4 w-32" />
                    <SkeletonItem className="h-6 w-16" />
                  </div>
                  <div className="bg-gray-300/40 p-3 rounded-full">
                    <SkeletonItem className="h-6 w-6 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointments Skeleton */}
            <motion.div variants={itemVariants}>
              <div className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <SkeletonItem className="h-6 w-40" />
                  <SkeletonItem className="h-8 w-28 rounded-md" />
                </div>
                <div className="space-y-4">
                  {[...Array(2)].map((_, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-4 flex justify-between items-center"
                    >
                      <div className="space-y-3">
                        <SkeletonItem className="h-5 w-48" />
                        <SkeletonItem className="h-4 w-32" />
                        <div className="flex items-center">
                          <SkeletonItem className="h-4 w-4 mr-2" />
                          <SkeletonItem className="h-4 w-40" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <SkeletonItem className="h-6 w-16 rounded-full" />
                        <SkeletonItem className="h-6 w-16 rounded-full" />
                        <SkeletonItem className="h-8 w-16 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Prescriptions Skeleton */}
            <motion.div variants={itemVariants}>
              <div className="border rounded-lg p-4 bg-white">
                <div className="mb-4">
                  <SkeletonItem className="h-6 w-40" />
                </div>
                <div className="space-y-4">
                  {[...Array(1)].map((_, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-2">
                          <SkeletonItem className="h-5 w-48" />
                          <SkeletonItem className="h-4 w-40" />
                          <SkeletonItem className="h-4 w-40" />
                        </div>
                        <SkeletonItem className="h-6 w-20 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        {[...Array(2)].map((_, medIdx) => (
                          <div key={medIdx} className="bg-gray-50 p-3 rounded">
                            <SkeletonItem className="h-4 w-36 mb-2" />
                            <SkeletonItem className="h-3 w-48" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Notifications Skeleton */}
            <motion.div variants={itemVariants}>
              <div className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <SkeletonItem className="h-6 w-32" />
                  <SkeletonItem className="h-8 w-36 rounded-md" />
                </div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border-l-4 border-gray-300 bg-gray-50"
                    >
                      <SkeletonItem className="h-5 w-40 mb-2" />
                      <SkeletonItem className="h-3 w-56" />
                      <SkeletonItem className="h-3 w-24 mt-2" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Medicine Search Skeleton */}
            <motion.div variants={itemVariants}>
              <div className="border rounded-lg p-4 bg-white">
                <div className="mb-4">
                  <SkeletonItem className="h-6 w-40" />
                </div>
                <SkeletonItem className="h-10 w-full rounded-md" />
                <div className="mt-4 space-y-3">
                  {[...Array(2)].map((_, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <SkeletonItem className="h-5 w-44 mb-2" />
                      <SkeletonItem className="h-3 w-32 mb-3" />
                      <div className="flex justify-between">
                        <SkeletonItem className="h-3 w-40" />
                        <SkeletonItem className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Quick Actions Skeleton */}
            <motion.div variants={itemVariants}>
              <div className="border rounded-lg p-4 bg-white">
                <div className="mb-4">
                  <SkeletonItem className="h-6 w-40" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, idx) => (
                    <div
                      key={idx}
                      className="h-24 rounded-md flex flex-col items-center justify-center bg-gray-200 animate-pulse"
                    >
                      <SkeletonItem className="h-8 w-8 mb-2 rounded-full" />
                      <SkeletonItem className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
