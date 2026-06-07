export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  lga: string;
  phone: string;
  email?: string | null;
  specialties: string[];
  ownership: "public" | "private";
  location?: { lat: number; lng: number } | null;
  description_md?: string | null;
  visiting_hours?: string | null;
  rating_avg: number;
  review_count: number;
  created_by?: string | null;
  created_at: string;
  updated_at?: string;
  distance_km?: number | null;
}

export interface Review {
  id: string;
  hospital_id: string;
  user_id: string;
  rating: number;
  text?: string | null;
  status: "pending" | "approved" | "hidden";
  created_at: string;
  updated_at?: string;
}

export interface HospitalImage {
  id: string;
  hospital_id: string;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
}

export interface AppUser {
  id: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
}

export type FilterState = {
  specialties: string[];
  ownership: "public" | "private" | null;
  radius: number | null;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};
