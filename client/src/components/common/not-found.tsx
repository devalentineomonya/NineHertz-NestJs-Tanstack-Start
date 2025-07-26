import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export function NotFound({ children }: { children?: any }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700 text-center"
      >
        <div className="space-y-5">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-green-400 to-green-600 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Page Not Found
          </h1>

          <div className="text-gray-600 dark:text-gray-300 text-lg">
            {children || (
              <p>
                The page you're looking for doesn't exist or has been moved.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-green-200/40 transition-all duration-300"
            >
              Go Back
            </motion.button>

            <Link to="/" className="flex-1">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-3 px-4 rounded-lg shadow hover:shadow-gray-200/30 transition-all duration-300"
              >
                Start Over
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
