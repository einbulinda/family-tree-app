export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  is_approved: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user?: User;
}

export interface Individual {
  id: number;
  user_id?: number;
  first_name: string;
  last_name: string;
  birth_date?: string;
  birth_place?: string;
  death_date?: string;
  death_place?: string;
  is_alive: boolean;
  bio?: string;
  photo_url?: string;
}

export interface Invitation {
  id: number;
  email: string;
  invited_by_user_id: number;
  status: string;
  created_at: string;
  invited_by_name: string;
}

export interface Relationship {
  id: number;
  individual_id: number;
  related_individual_id: number;
  relationship_type: string;
  individual_first_name: string;
  individual_last_name: string;
  related_first_name: string;
  related_last_name: string;
}
