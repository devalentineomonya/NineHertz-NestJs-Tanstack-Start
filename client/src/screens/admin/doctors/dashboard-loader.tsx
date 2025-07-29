export const DashboardLoader = () => {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-32"></div>
            </div>
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart Skeleton */}
            <div className="animate-pulse bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between mb-6">
                <div>
                  <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="flex space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-8 w-16 bg-gray-200 rounded-lg"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 h-48 flex items-end gap-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gray-300 rounded-t-lg"
                    style={{ height: `${20 + i * 15}%` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Department Stats Skeleton */}
            <div className="animate-pulse bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between mb-6">
                <div>
                  <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              </div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-8 ml-auto"></div>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-300 rounded-full"
                        style={{ width: `${20 + i * 15}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Activity Feed Skeleton */}
            <div className="animate-pulse bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between mb-4">
                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3 p-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Doctors Skeleton */}
            <div className="animate-pulse bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between mb-4">
                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Table Skeleton */}
        <div className="animate-pulse bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between">
              <div>
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="flex space-x-3">
                <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {[...Array(7)].map((_, i) => (
                    <th key={i} className="px-6 py-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-pulse bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between mb-6">
              <div>
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-pulse bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between mb-6">
              <div>
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
