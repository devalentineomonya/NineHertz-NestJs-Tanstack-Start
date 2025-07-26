import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Clock, MessageSquare, Video, Zap } from "lucide-react";
import { useRef } from "react";

const HomeHero = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  // Feature cards data
  const features = [
    {
      title: "24/7 Availability",
      icon: <Clock className="w-5 h-5" />,
      color: "bg-green-500",
      position: "top-0 left-0",
      animation: {
        y: [0, -10, 0],
        transition: { duration: 3, repeat: Infinity },
      },
    },
    {
      title: "TeleMedicine",
      icon: <Video className="w-5 h-5" />,
      color: "bg-blue-500",
      position: "top-1/4 -right-10",
      animation: {
        y: [0, -15, 0],
        transition: { duration: 4, repeat: Infinity },
      },
    },
    {
      title: "SMS Alerts",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "bg-indigo-500",
      position: "bottom-10 -left-10",
      animation: {
        y: [0, -8, 0],
        rotate: [0, 5, 0, -5, 0],
        transition: { duration: 5, repeat: Infinity },
      },
    },
    {
      title: "Instant Processing",
      icon: <Zap className="w-5 h-5" />,
      color: "bg-emerald-500",
      position: "bottom-0 right-0",
      animation: {
        scale: [1, 1.1, 1],
        transition: { duration: 2, repeat: Infinity },
      },
    },
  ];

  return (
    <section ref={ref} id="hero" className="min-h-[70dvh] w-full py-32">
      <div className="flex flex-col lg:flex-row gap-10 items-center w-full">
        <div className="flex-1">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-6xl"
          >
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              Transforming Healthcare Through{" "}
              <span className="text-green-600">Digital Innovation</span>
            </motion.h1>

            <motion.p
              className="mt-6 text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              Inefficient patient record management, regulatory changes, and
              workforce shortages often compromise patient safety. As a leading
              healthcare app development company, we allow medical institutes to
              curate custom software, streamline processes, and better manage
              resources.
            </motion.p>
            <motion.div className="mt-4" variants={item}>
              <Link to="/admin/dashboard">
                <motion.button
                  className="bg-gradient-to-b from-green-400 to-green-600 h-11 min-w-48 group rounded-md relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-green-400 to-green-600 shadow-lg shadow-green-400/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Button
                    className="w-full h-12 bg-transparent hover:border-transparent hover:bg-transparent relative z-10"
                    asChild
                  >
                    <motion.div className="flex items-center gap-2">
                      Get Started
                      <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                  </Button>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="flex-1 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
            className="relative"
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-green-500 rounded-full blur-2xl opacity-50 -z-10 animate-pulse" />

            {/* Floating Feature Cards */}
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`absolute ${feature.position} w-32 h-32 z-20`}
                animate={feature.animation}
                whileHover={{
                  scale: 1.1,
                  rotate: [0, 5, -5, 0],
                  transition: { duration: 0.5 },
                }}
                whileTap={{ scale: 0.9 }}
              >
                <Card className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-white/90 backdrop-blur-sm shadow-lg">
                  <div className={`${feature.color} p-2 rounded-full mb-2`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                </Card>
              </motion.div>
            ))}

            {/* Gradient border effect */}
            <div className="p-1 rounded-2xl shadow-lg z-10 relative">
              <motion.img
                src="/home-hero.png"
                className="rounded-2xl shadow-inner w-full max-w-md"
                whileHover={{
                  scale: 1.03,
                  transition: { duration: 0.3 },
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
