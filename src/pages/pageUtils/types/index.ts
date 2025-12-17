export interface Schedule {
  date: string;
  start_time: string;
  end_time: string;
}

export interface Reservation {
  id: string;
  reservation_code: string;
  user_id: string;
  full_name: string;
  advisor: string;
  purpose: string;
  remarks: string;
  status: string;
  equipments: string[];
  participants: string[];
  room_ids: number[];
  schedules: Schedule[];
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: number;
  name: string;
  room: string;
  status: string;
  description: string;
  images: string[];
  capacity: number;
}

export interface User {
  avatar_url: string;
  email: string;
  full_name: string;
  id: string;
  identifier: string;
  is_suspended: boolean;
  type: string;
}

export interface RoomUsage {
  room_id: number;
  room_name: string;
  total_usage: number;
}

export interface UserCount {
  user_type: string;
  total: number;
}

export interface UsageByPurpose {
  room_id: number;
  room_name: string;
  purpose: string;
  total_usage: number;
}

export interface HoursPerRoom {
  period_start: string;
  room_id: number;
  total_hours_used: number;
}
