"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  Calendar,
  Stethoscope,
  Pill,
  ClipboardList,
} from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function PatientDashboardStats() {
  const stats = [
    {
      title: "Total Orders",
      value: "1,245",
      icon: <Check className="h-6 w-6" />,
      gradient:
        "from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20",
      buttonClass: "hover:bg-green-600 hover:text-white",
      link: "/orders",
      color: "green",
    },
    {
      title: "Appointments",
      value: "568",
      icon: <Calendar className="h-6 w-6" />,
      gradient:
        "from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20",
      buttonClass: "hover:bg-blue-600 hover:text-white",
      link: "/appointments",
      color: "blue",
    },
    {
      title: "Consultations",
      value: "892",
      icon: <Stethoscope className="h-6 w-6" />,
      gradient:
        "from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20",
      buttonClass: "hover:bg-purple-600 hover:text-white",
      link: "/appointmeent?type=consultation",
      color: "purple",
    },
    {
      title: "Prescriptions",
      value: "1,034",
      icon: <ClipboardList className="h-6 w-6" />,
      gradient:
        "from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20",
      buttonClass: "hover:bg-orange-600 hover:text-white",
      link: "/prescriptions",
      color: "orange",
    },
    {
      title: "Medications",
      value: "2,456",
      icon: <Pill className="h-6 w-6" />,
      gradient:
        "from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20",
      buttonClass: "hover:bg-red-600 hover:text-white",
      link: "/medications",
      color: "red",
    },
  ];

  return (
    <>
      {/* Carousel for small screens */}
      <div className="block md:hidden">
        <Carousel className="w-full max-w-xs mx-auto">
          <CarouselContent>
            {stats.map((stat, index) => (
              <CarouselItem key={index}>
                <Card
                  className={`text-center bg-gradient-to-br ${stat.gradient} border-0 shadow-sm`}
                >
                  <CardHeader>
                    <div
                      className={`h-12 w-12 mx-auto flex items-center justify-center rounded-full bg-${stat.color}-500 text-white`}
                    >
                      {stat.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-normal text-muted-foreground mb-2">
                      {stat.title}
                    </p>
                    <h4 className="text-2xl font-semibold">{stat.value}</h4>
                  </CardContent>
                  <CardFooter className="justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`text-xs font-semibold bg-background ${stat.buttonClass}`}
                      asChild
                    >
                      <a href={stat.link}>View Details</a>
                    </Button>
                  </CardFooter>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Grid for medium screens and above */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`text-center bg-gradient-to-br ${stat.gradient} border-0 shadow-sm`}
          >
            <CardHeader>
              <div
                className={`h-12 w-12 mx-auto flex items-center justify-center rounded-full bg-${stat.color}-500 text-white`}
              >
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-normal text-muted-foreground mb-2">
                {stat.title}
              </p>
              <h4 className="text-2xl font-semibold">{stat.value}</h4>
            </CardContent>
            <CardFooter className="justify-center">
              <Button
                variant="outline"
                size="sm"
                className={`text-xs font-semibold bg-background ${stat.buttonClass}`}
                asChild
              >
                <a href={stat.link}>View Details</a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
