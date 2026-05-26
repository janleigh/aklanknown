import type { Review } from "@/lib/types/supabase";

export type {
	Bookmark,
	CachedRoute,
	Location,
	LocationImage,
	Review,
	UserProfile,
} from "@/lib/types/supabase";

export interface LocationCardData {
	id: string;
	name: string;
	image: string;
	distance: string;
	rating: number;
	category: string;
	banner_image_url: string;
}

export interface LocationDetailData {
	id: string;
	name: string;
	description: string;
	latitude: number;
	longitude: number;
	banner_image_url: string;
	panorama_image_url: string;
	street: string;
	barangay: string;
	town: string;
	reviews: number;
	rating: number;
	images: string[];
}

export interface ReviewWithUser extends Review {
	userName: string;
	userAvatar?: string;
}

export interface Event {
	id: string;
	title: string;
	date: string;
	time: string;
	location: string;
	description: string;
	image: string;
}

export type UserRole = "user" | "admin";
