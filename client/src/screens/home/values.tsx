import { ClipboardList, ShieldCheck, Users } from "lucide-react";
import { GlowCard } from "@/components/nurui/spotlight-card";
import SectionLayout from "@/components/shared/layouts/section-layout";
import { coreValues } from "./values-service-data";
import { ServiceCard } from "./values-card";

interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const CoreValues = () => {
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
      description="Inefficient patient record management, regulatory changes, and workforce shortages often compromise patient safety in the healthcare sector."
      number="03"
      name="Core Values"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {coreValues.map((coreValue, index) => (
          <GlowCard>
            <ServiceCard
              key={index}
              color={coreValue.color}
              icon={coreValue.icon}
              title={coreValue.title}
              description={coreValue.description}
              mockup={coreValue.mockup}
            />
          </GlowCard>
        ))}
      </div>

      <div className="w-full">
        <div className="relative w-full grid divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3 mt-4">
          {features.map((feature, index) => (
            <FeatureItem {...feature} key={index} />
          ))}
        </div>
      </div>
    </SectionLayout>
  );
};

const FeatureItem: React.FC<FeatureItem> = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-green-600" />
        <h3 className="text-title text-sm font-medium">{title}</h3>
      </div>
      <p className="text-body text-sm">{description}</p>
    </div>
  );
};

export default CoreValues;
