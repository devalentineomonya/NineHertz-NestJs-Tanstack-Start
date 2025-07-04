import { createFileRoute } from "@tanstack/react-router";
import HomeHero from "@/screens/home/hero";
import Services from "@/screens/home/services";
import Values from "@/screens/home/values";
import Appointment from "@/screens/home/appointment";
import Telemedicine from "@/screens/home/telemedicine";
import { SmoothCursor } from "@/components/ui/smooth-cursor";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="max-w-6xl px-4 mx-auto w-full mt-4">
      <HomeHero />
      <Services />
      <Values />
      <Appointment />
      <Telemedicine />
      <SmoothCursor />
    </main>
  );
}
