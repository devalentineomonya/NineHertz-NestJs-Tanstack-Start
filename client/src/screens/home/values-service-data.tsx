import { CalendarCheck, Pill, Video } from "lucide-react";

export const coreValues = [
    {
      icon: <CalendarCheck className="w-10 h-10 text-[#10b981]" />,
      title: "Doctor Appointment Solution",
      description:
        "Streamline appointment processes by providing patients access to doctor availability, consultation schedules, and fees. Eliminate long physical queues and improve patient experience.",
      color: "#10b981",
      mockup: (
        <div className="absolute inset-0 p-4">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3 px-3 py-1.5 bg-foreground/5 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
                <div className="text-[10px] text-muted-foreground">
                  Appointments
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-foreground/10"></div>
                <div className="w-4 h-4 rounded bg-foreground/10"></div>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 gap-2">
              <div className="bg-foreground/5 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#10b981]/20 mr-3"></div>
                  <div>
                    <div className="h-2 w-24 bg-foreground/10 rounded mb-1"></div>
                    <div className="h-1.5 w-16 bg-foreground/5 rounded"></div>
                  </div>
                  <div className="ml-auto text-[10px] px-2 py-1 bg-[#10b981]/10 text-[#10b981] rounded">
                    10:30 AM
                  </div>
                </div>
              </div>
              <div className="bg-foreground/5 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-foreground/10 mr-3"></div>
                  <div>
                    <div className="h-2 w-24 bg-foreground/10 rounded mb-1"></div>
                    <div className="h-1.5 w-16 bg-foreground/5 rounded"></div>
                  </div>
                  <div className="ml-auto text-[10px] px-2 py-1 bg-foreground/5 rounded">
                    2:15 PM
                  </div>
                </div>
              </div>
              <div className="bg-[#10b981]/10 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#10b981]/20 mr-3"></div>
                  <div>
                    <div className="h-2 w-24 bg-foreground/10 rounded mb-1"></div>
                    <div className="h-1.5 w-16 bg-foreground/5 rounded"></div>
                  </div>
                  <div className="ml-auto text-[10px] px-2 py-1 bg-[#10b981]/20 text-[#10b981] rounded">
                    4:45 PM
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: <Pill className="w-10 h-10 text-[#059669]" />,
      title: "Pharmacy App Development",
      description:
        "Comprehensive solutions for pharmacy management including inventory tracking, medicine ordering, and prescription management. Maintain stock in real-time and process online orders efficiently.",
      color: "#059669",
      mockup: (
        <div className="absolute inset-0 p-4">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3 px-3 py-2 bg-foreground/5 rounded-t-lg border-b border-border">
              <div className="text-[10px] text-muted-foreground">
                Medication Inventory
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-[#059669]/20"></div>
                <div className="w-4 h-4 rounded bg-foreground/10"></div>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div className="flex flex-col space-y-3">
                <div className="bg-foreground/5 rounded-lg p-3">
                  <div className="h-4 w-3/4 bg-foreground/10 rounded mb-2"></div>
                  <div className="h-2 w-1/2 bg-[#059669]/20 rounded"></div>
                </div>
                <div className="bg-[#059669]/10 rounded-lg p-3">
                  <div className="h-4 w-3/4 bg-foreground/10 rounded mb-2"></div>
                  <div className="h-2 w-1/2 bg-[#059669]/30 rounded"></div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="bg-foreground/5 rounded-lg p-4 mb-3 flex-1">
                  <div className="h-3 w-full bg-foreground/10 rounded mb-3"></div>
                  <div className="h-8 w-8 rounded-full bg-[#059669]/20 mx-auto"></div>
                </div>
                <div className="bg-foreground/5 rounded-lg p-2 flex justify-between">
                  <div className="h-3 w-16 bg-foreground/10 rounded"></div>
                  <div className="h-6 w-6 rounded-full bg-[#059669]/10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: <Video className="w-10 h-10 text-[#047857]" />,
      title: "Telemedicine Solutions",
      description:
        "Connect patients with healthcare providers through secure video consultations. Our platform enables online prescriptions, medical record maintenance, and digital payments for comprehensive remote care.",
      color: "#047857",
      mockup: (
        <div className="absolute inset-0 p-4">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Video className="w-4 h-4 text-[#047857]" />
                <div className="text-[10px] text-muted-foreground">
                  Video Consultation
                </div>
              </div>
              <div className="px-2 py-1 rounded bg-[#047857]/20 text-[10px] text-[#047857]">
                Live
              </div>
            </div>
            <div className="flex-1 grid grid-rows-2 gap-3">
              <div className="bg-foreground/5 rounded-lg relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#047857]/20 flex items-center justify-center">
                    <Video className="w-8 h-8 text-[#047857]" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 w-1/3 h-1/4 bg-foreground/5 rounded-lg border-2 border-background"></div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-foreground/5 rounded-lg p-2 flex flex-col items-center">
                  <div className="w-6 h-6 bg-[#047857]/20 rounded-full mb-1"></div>
                  <div className="h-1 w-full bg-foreground/10 rounded"></div>
                </div>
                <div className="bg-foreground/5 rounded-lg p-2 flex flex-col items-center">
                  <div className="w-6 h-6 bg-foreground/10 rounded-full mb-1"></div>
                  <div className="h-1 w-full bg-foreground/10 rounded"></div>
                </div>
                <div className="bg-[#047857]/10 rounded-lg p-2 flex flex-col items-center">
                  <div className="w-6 h-6 bg-[#047857]/30 rounded-full mb-1"></div>
                  <div className="h-1 w-full bg-foreground/10 rounded"></div>
                </div>
                <div className="bg-foreground/5 rounded-lg p-2 flex flex-col items-center">
                  <div className="w-6 h-6 bg-foreground/10 rounded-full mb-1"></div>
                  <div className="h-1 w-full bg-foreground/10 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];
