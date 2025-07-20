import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useGetDoctorAvailability = (
  doctorId: string,
  dayOfWeek?: string
) => {
  const dataService = new DataServices();
  return useQuery({
    queryKey: ["doctorAvailability", doctorId],
    queryFn: async () => {
      const response = await dataService.api.doctors
        ._id_availability(doctorId)
        .get.call({
          pathParams: { dayOfWeek },
        });
      return response.data;
    },
    enabled: !!doctorId,
  });
};
