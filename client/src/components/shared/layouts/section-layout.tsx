import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";
interface SectionLayoutProps {
  children: React.ReactNode;
  id: string;
  className?: string;
  title: string;
  description: string;
  number: string;
  name: string;
}
const SectionLayout: React.FC<SectionLayoutProps> = ({
  className,
  children,
  id,
  title,
  description,
  number,
  name,
}) => {
  return (
    <section id={id} className={cn("min-h-[60vh]", className)}>
      <div className="flex items-center justify-between max-md:flex-col-reverse">
        <div className="text-start mb-16">
          <motion.h2
            className="text-4xl font-bold mb-4 text-green-700 dark:text-green-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.h2>
          <motion.p
            className="max-w-3xl  text-lg text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {description}
          </motion.p>
        </div>
        <div>
          <motion.div
            className="text-center mb-16 flex items-end gap-x-2 mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-14 h-1 bg-green-600 mx-auto mt-4"></div>
            <div className="flex items-center gap-x-4">
              <span className="text-5xl font-semibold tracking-wider text-green-600 uppercase dark:text-green-400">
                {number}
              </span>
              <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {name}
              </h2>
            </div>
          </motion.div>
        </div>
      </div>
      {children}
    </section>
  );
};

export default SectionLayout;
