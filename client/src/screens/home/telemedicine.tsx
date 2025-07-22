import SectionLayout from "@/components/shared/layouts/section-layout";
import { HeroVideoDialog } from "@/components/magicui/hero-video-dialog";
import {
  Video,
  Stethoscope,
  ClipboardList,
  Smartphone,
  ShieldCheck,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlidingNumber } from "@/components/animate-ui/text/sliding-number";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/motion";

const TelemedicineSection = () => {
  const features = [
    {
      icon: Stethoscope,
      title: "Specialist Access",
      desc: "Connect with 200+ specialists nationwide",
    },
    {
      icon: ClipboardList,
      title: "Medical Records",
      desc: "Secure access to complete health history",
    },
    {
      icon: Smartphone,
      title: "Mobile Access",
      desc: "Full functionality on any device",
    },
    {
      icon: ShieldCheck,
      title: "HIPAA Compliant",
      desc: "End-to-end encrypted communication",
    },
  ];

  return (
    <SectionLayout
      id="telemedicine"
      name="Telemedicine"
      number="04"
      title="Virtual Care That Comes To You"
      description="Experience healthcare without boundaries with our telemedicine platform. Connect with board-certified doctors in minutes, not days - anytime, anywhere."
      className="py-24"
    >
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        variants={staggerContainer(0.1, 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <motion.div
          className="space-y-8"
          variants={fadeIn("right", "spring", 0.2, 1)}
        >
          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-start p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/50 hover:border-green-300 transition-all"
                variants={fadeIn("right", "spring", index * 0.1, 0.75)}
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 20px rgba(72, 187, 120, 0.1)",
                }}
              >
                <div className="mr-4 mt-1">
                  <feature.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 space-y-4">
            <motion.div variants={fadeIn("right", "spring", 0.5, 1)}>
              <Button className="flex items-center gap-2 bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 h-12 w-full shadow-lg shadow-green-200 dark:shadow-green-900/30">
                <Video className="w-5 h-5" />
                Schedule Virtual Visit
              </Button>
            </motion.div>

            <motion.div variants={fadeIn("right", "spring", 0.6, 1)}>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-green-600 text-green-600 dark:text-green-400 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 h-12 w-full"
              >
                <HeartPulse className="w-5 h-5" />
                Learn More About Telehealth
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="relative"
          variants={fadeIn("left", "spring", 0.3, 1)}
        >
          {/* Gradient background */}
          <div className="absolute -inset-4 rounded-2xl bg-gradient-to-tr from-green-400/10 via-teal-300/10 to-emerald-400/10 z-0 blur-xl opacity-70"></div>
          <div className="absolute -inset-2 rounded-xl bg-gradient-to-br from-green-200/20 to-teal-300/20 z-0"></div>

          <motion.div
            whileHover={{
              scale: 1.02,
              boxShadow: "0 20px 40px rgba(72, 187, 120, 0.2)",
            }}
            transition={{ duration: 0.4 }}
          >
            <HeroVideoDialog
              className="relative z-10 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl"
              animationStyle="from-center"
              videoSrc="https://media.istockphoto.com/id/1391268546/video/female-doctor-talking-with-her-patient-remotely-via-telemedicine-from-her-medical-office.mp4?s=mp4-640x640-is&k=20&c=1RmtpWqwciJk_tKC5evywM23W9tqJNGWTCQngz7-7SA="
              thumbnailSrc="/telemedicine.png"
              thumbnailAlt="Doctor providing virtual care through telemedicine"
            />
          </motion.div>

          <motion.div
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full shadow-lg px-6 py-3 flex items-center gap-2 z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                delay: 1,
                type: "spring",
                stiffness: 100,
              },
            }}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Live demo available
            </span>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        className="mt-24 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8 border border-green-100 dark:border-green-900/30"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="flex flex-col gap-y-3">
            <div className="text-4xl font-bold text-green-700 dark:text-green-400 mb-2 flex items-center gap-x-1">
            <SlidingNumber
              transition={{ stiffness: 100, damping: 30, mass: 0.6 }}
              padStart
              inViewOnce={false}
              inView
              number={24}
            />
            /<span className="text-3xl">7</span>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            Hour access to healthcare providers
          </p>
        </div>
        <div className="flex flex-col gap-y-3">
          <div className="text-4xl font-bold text-green-700 dark:text-green-400 mb-2 flex items-center gap-x-1">
            <SlidingNumber  transition={{ stiffness: 100, damping: 30, mass: 0.6 }} padStart inViewOnce={false} inView number={98} />
            <span className="text-3xl">%</span>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            Patient satisfaction rate
          </p>
        </div>
        <div className="flex flex-col gap-y-3">
          <div className="text-4xl font-bold text-green-700 dark:text-green-400 mb-2 flex items-center gap-x-1">
            <SlidingNumber  transition={{ stiffness: 100, damping: 30, mass: 0.6 }} padStart inViewOnce={false} inView number={10} />
            <span className="text-3xl">min</span>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            Average wait time for appointment
          </p>
        </div>
      </motion.div>
    </SectionLayout>
  );
};

export default TelemedicineSection;
