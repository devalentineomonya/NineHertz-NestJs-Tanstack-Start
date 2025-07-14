import { useQuery } from '@tanstack/react-query';
import { DataServices } from '../data/data-service';


export const useGetDoctors = () => {
    const dataService = new DataServices()
  return useQuery<{total:number, data:DoctorResponseDto[]}>({
    queryKey: ['doctors'],
    queryFn: async () => {
      const response = await dataService.api.doctors.get.call()
    return response.data
    },
    staleTime: 1000 * 60 * 5,
  });
};
