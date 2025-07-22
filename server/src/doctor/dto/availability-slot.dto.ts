import { IsEnum, IsOptional } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

enum DaysOfWeek {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
}

export class DoctorAvailabilityDto {
  @ApiProperty({
    description: 'List of available slots for the doctor.',
    example: [{ start: '09:00', end: '10:00', day: 'Monday' }],
  })
  availableSlots: AvailabilitySlotDto[];

  @ApiProperty({
    description: 'List of busy slots for the doctor.',
    example: [
      { start: '11:00', end: '12:00', day: 'Monday', type: 'appointment' },
    ],
  })
  busySlots: BusySlotDto[];

  @ApiProperty({
    description: 'The day for which the availability is specified.',
    example: 'Monday',
  })
  day: string | undefined;
}

export class AvailabilitySlotDto {
  start: string;
  end: string;
  day: string;
}

export class BusySlotDto {
  day: string;
  start: string;
  end: string;
  type: 'appointment' | 'busy';
}

export class DoctorAvailabilityQueryDto {
  @IsOptional()
  @IsEnum(DaysOfWeek)
  dayOfWeek?: DaysOfWeek;
}
