export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Bus {
  id: number;
  bus_number?: string;
  route_id?: number | null;
  capacity?: number;
  current_stop_id?: number | null;
  status?: 'active' | 'inactive' | 'maintenance';
  available_seats?: number;
  route?: Route;
  current_stop?: Stop;
  passengers?: Passenger[];
  created_at?: string;
  updated_at?: string;
}

export interface Route {
  id: number;
  name: string;
  description?: string;
  stops?: Stop[];
  buses?: Bus[];
  stops_count?: number;
  buses_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Stop {
  id: number;
  route_id: number;
  stop_name: string;
  stop_order: number;
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

export interface Passenger {
  id: number;
  first_name: string;
  last_name: string;
  status: 'waiting' | 'onboarded' | 'cancelled';
  assigned_bus_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface QueueEntry {
  id: number;
  bus_id: number;
  passenger_id: number;
  queue_order: number;
  queued_at: string;
  passenger?: Passenger;
}

export interface TrackLog {
  id: number;
  bus_id: number;
  stop_id?: number | null;
  stop_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  speed?: number | null;
  logged_at: string;
  stop?: Stop;
}

export interface LiveBusData {
  bus_id: number;
  bus_number?: string;
  status: string;
  route?: string;
  current_stop?: string;
  last_log?: TrackLog | null;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  status: number;
  data: {
    message?: string;
    [key: string]: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}
