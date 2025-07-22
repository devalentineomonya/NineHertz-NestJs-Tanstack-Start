import SectionLayout from "@/components/shared/layouts/section-layout";
import { motion } from "framer-motion";
import {
  Calendar,
  ArrowRight,
  ClipboardList,
  MessageCircle,
  ShieldCheck,
  Video,
  Pill,
  CalendarCheck,
} from "lucide-react";

const Appointment = () => {
  return (
    <SectionLayout
      id="appointment"
      name="Appointment"
      number="04"
      title="Streamlined Appointment Management"
      description="Our intuitive scheduling system reduces wait times by 40% and increases patient satisfaction. Easily book, track, and manage appointments with real-time availability."
      className="py-32"
    >
      <div className="flex flex-col md:flex-row gap-10 items-center w-full">
        <motion.div
          className="flex-1 w-full"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
          >
            {/* Doctor Appointment Solution */}
            <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-xl border border-green-100 dark:border-gray-700">
              <div className="flex items-start mb-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <CalendarCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-bold text-lg text-green-800 dark:text-green-200">
                  Doctor Appointment Solution
                </h4>
              </div>
              <ul className="space-y-2 pl-[52px]">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Real-time doctor availability with weekly schedules
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Transparent appointment fees and specialties
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Queue management eliminating physical wait times
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Automated SMS/email appointment reminders
                </li>
              </ul>
            </div>

            {/* Telemedicine */}
            <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-xl border border-green-100 dark:border-gray-700">
              <div className="flex items-start mb-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <Video className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-bold text-lg text-green-800 dark:text-green-200">
                  Telemedicine
                </h4>
              </div>
              <ul className="space-y-2 pl-[52px]">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Secure video appointments with healthcare providers
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Digital prescription generation and delivery
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Integrated medical records access
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Online payment processing for appointments
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            className="w-full gap-4 mt-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg h-12 bg-gradient-to-b from-green-500 via-green-400 to-green-600 shadow-lg shadow-green-400/25   relative z-10 transition-colors group"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <ClipboardList className="text-white" />
              Request Demo
              <ArrowRight className="ml-1 transition-transform group-hover:translate-x-1 text-white" />
            </motion.button>
          </motion.div>
        </motion.div>
        <motion.div
          className="flex-1 relative"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          {/* Gradient background */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-green-400/20 to-emerald-300/30 rounded-2xl blur-xl z-0"></div>
          <div className="absolute -inset-2 bg-gradient-to-br from-green-100/40 to-teal-200/30 rounded-xl z-0"></div>

          {/* Animated border */}
          <motion.div
            className="relative z-10 rounded-2xl overflow-hidden border-4 border-white shadow-xl"
            whileHover={{
              boxShadow: "0 0 30px rgba(72, 187, 120, 0.4)",
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.img
              src="/appointments.png"
              alt="Appointment scheduling interface"
              className="w-full"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>
        </motion.div>
      </div>
    </SectionLayout>
  );
};

export default Appointment;
