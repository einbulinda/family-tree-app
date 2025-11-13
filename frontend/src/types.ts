export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  is_approved: boolean;
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

export interface Relationship {
  id: number;
  individual_id: number;
  related_individual_id: number;
  relationship_type: string; // 'parent', 'child', 'spouse', 'sibling'
}
