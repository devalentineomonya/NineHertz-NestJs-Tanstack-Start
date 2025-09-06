import { useQuery } from "@tanstack/react-query";
import { dataServices } from "../data/data-service";

export const useGetDoctorAvailability = (
  doctorId: string,
  dayOfWeek?: string
) => {
  return useQuery({
    queryKey: ["doctorAvailability", doctorId],
    queryFn: async () => {
      const response = await dataServices.api.doctors
        ._id_availability(doctorId)
        .get.call({
          pathParams: { dayOfWeek },
        });
      return response.data;
    },
    enabled: !!doctorId,
  });
};
