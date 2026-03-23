import axios from 'axios';
import type { User, Listing, Bundle, MoveAnnouncement, Message, Conversation } from './types';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth — named routes, no trailing slash
export const register = (email: string, password: string, name: string) =>
  api.post<{ access_token: string; token_type: string }>('/auth/register', { email, password, name });

export const login = (email: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  return api.post<{ access_token: string; token_type: string }>('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};

export const getMe = () => api.get<User>('/auth/me');

export const updateProfile = (data: Partial<User>) => api.put<User>('/users/me', data);

export const getUser = (id: number) => api.get<User>(`/users/${id}`);

// Listings
export interface ListingParams {
  city?: string;
  category?: string;
  condition?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  skip?: number;
  limit?: number;
}

// Collection route defined as "/" → trailing slash required
export const getListings = (params?: ListingParams) =>
  api.get<Listing[]>('/listings/', { params });

export const createListing = (data: Partial<Listing>) => api.post<Listing>('/listings/', data);

// Named routes → no trailing slash
export const getListing = (id: number) => api.get<Listing>(`/listings/${id}`);

export const updateListing = (id: number, data: Partial<Listing>) =>
  api.put<Listing>(`/listings/${id}`, data);

export const deleteListing = (id: number) => api.delete(`/listings/${id}`);

export const saveListing = (id: number) => api.post(`/listings/${id}/save`);

export const unsaveListing = (id: number) => api.delete(`/listings/${id}/save`);

export const getSavedListings = () => api.get<Listing[]>('/listings/saved/me');

// Bundles — collection "/" routes get trailing slash, named routes don't
export interface BundleParams {
  city?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

export const getBundles = (params?: BundleParams) => api.get<Bundle[]>('/bundles/', { params });

export const createBundle = (data: {
  title: string;
  description: string;
  city: string;
  discount_percentage: number;
  listing_ids: number[];
}) => api.post<Bundle>('/bundles/', data);

export const getBundle = (id: number) => api.get<Bundle>(`/bundles/${id}`);

export const deleteBundle = (id: number) => api.delete(`/bundles/${id}`);

// Moves
export interface MoveParams {
  city?: string;
  move_type?: string;
  skip?: number;
  limit?: number;
}

export const getMoves = (params?: MoveParams) =>
  api.get<MoveAnnouncement[]>('/moves/', { params });

export const createMove = (data: Partial<MoveAnnouncement>) =>
  api.post<MoveAnnouncement>('/moves/', data);

export const getMoveMatches = () => api.get<MoveAnnouncement[]>('/moves/matches');

export const deleteMove = (id: number) => api.delete(`/moves/${id}`);

// Messages — collection "/" gets trailing slash, named routes don't
export const getConversations = () => api.get<Conversation[]>('/messages/conversations');

export const getMessages = (userId: number) => api.get<Message[]>(`/messages/${userId}`);

export const sendMessage = (data: { receiver_id: number; content: string; listing_id?: number }) =>
  api.post<Message>('/messages/', data);

export default api;
