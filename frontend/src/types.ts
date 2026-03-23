export interface User {
  id: number;
  email: string;
  name: string;
  city: string | null;
  move_type: string | null;
  move_date: string | null;
  bio: string | null;
  phone: string | null;
  created_at: string;
}

export interface Listing {
  id: number;
  user_id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  city: string;
  image_url: string | null;
  status: string;
  urgent: boolean;
  move_out_date: string | null;
  created_at: string;
  user: User;
  is_saved: boolean;
}

export interface Bundle {
  id: number;
  user_id: number;
  title: string;
  description: string;
  discount_percentage: number;
  city: string;
  created_at: string;
  user: User;
  listings: Listing[];
  total_price: number;
  discounted_price: number;
}

export interface MoveAnnouncement {
  id: number;
  user_id: number;
  move_type: string;
  from_city: string | null;
  to_city: string | null;
  move_date: string;
  message: string | null;
  looking_for: string | null;
  budget_range: string | null;
  created_at: string;
  user: User;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  listing_id: number | null;
  content: string;
  is_read: boolean;
  created_at: string;
  sender: User;
  receiver: User;
}

export interface Conversation {
  other_user: User;
  last_message: Message;
  unread_count: number;
}
