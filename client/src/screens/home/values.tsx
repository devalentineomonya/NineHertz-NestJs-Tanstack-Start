import {
  ClipboardList,
  ShieldCheck,
  Users,
  CalendarCheck,
  Pill,
  Video,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SectionLayout from "@/components/shared/layouts/section-layout";

// Reusable FeatureCard component
const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) => (
  <Card className="h-full transition-transform hover:scale-[1.02]">
    <CardHeader>
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </CardContent>
  </Card>
);

// Reusable FeatureItem component
const FeatureItem = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) => (
  <div className="flex items-start p-4 bg-green-50 dark:bg-green-900/20 rounded-lg w-full">
    <div className="mr-4 mt-1">
      <Icon className="w-6 h-6 text-green-600 dark:text-green-400" />
    </div>
    <div>
      <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  </div>
);

const CoreValues = () => {
  // Services data for mapping
  const services = [
    {
      icon: CalendarCheck,
      title: "Doctor Appointment Solution",
      description:
        "Streamline appointment processes by providing patients access to doctor availability, consultation schedules, and fees. Eliminate long physical queues and improve patient experience with our digital solution.",
    },
    {
      icon: Pill,
      title: "Pharmacy App Development",
      description:
        "Comprehensive solutions for pharmacy management including inventory tracking, medicine ordering, and prescription management. Maintain stock in real-time and process online orders efficiently.",
    },
    {
      icon: Video,
      title: "Telemedicine Solutions",
      description:
        "Connect patients with healthcare providers through secure video consultations. Our platform enables online prescriptions, medical record maintenance, and digital payments for comprehensive remote care.",
    },
  ];

  // Features data for mapping
  const features = [
    {
      icon: ClipboardList,
      title: "Patient Record Management",
      description: "Secure EHR systems with real-time access and analytics",
    },
    {
      icon: ShieldCheck,
      title: "Regulatory Compliance",
      description: "Automated compliance tracking for HIPAA, GDPR, and more",
    },
    {
      icon: Users,
      title: "Workforce Optimization",
      description: "AI-driven scheduling to address staff shortages",
    },
  ];

  return (
    <SectionLayout
      id="values"
      className="py-32"
      title="Addressing Healthcare Challenges"
      description=" Inefficient patient record management, regulatory changes, and
            workforce shortages often compromise patient safety in the
            healthcare sector."
      number="03"
      name="Core Values"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <FeatureCard
            key={index}
            icon={service.icon}
            title={service.title}
            description={service.description}
          />
        ))}
      </div>

      <div className="w-full">
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureItem
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </SectionLayout>
  );
};

export default CoreValues;
