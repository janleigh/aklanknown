type Role = "user" | "admin";

export interface Bookmark {
	id: string;
	user_id: string | null;
	location_id: string | null;
	created_at: string;
}

export interface CachedRoute {
	id: string;
	location_id: string | null;
	cached_at: string;
	route_data: string;
	distance_m: number | null;
	distance_s: number | null;
}

export interface LocationImage {
	id: string;
	location_id: string | null;
	created_at: string;
	image_url: string;
}

export interface Location {
	id: string;
	created_at: string;
	name: string;
	street: string;
	barangay: string;
	town: string;
	latitude: number | null;
	longitude: number | null;
	banner_image_url: string;
	panorama_image_url: string;
	description_en: string | null;
	description_tl: string | null;
	description_akl: string | null;
}

export interface Review {
	id: string;
	created_at: string;
	location_id: string | null;
	user_id: string | null;
	rating: number | null;
	comment: string | null;
	is_flagged: boolean | null;
}

export interface UserProfile {
	id: string;
	created_at: string | null;
	name: string;
	email: string;
	avatar_url: string;
	role: Role;
	google_id: string | null;
	facebook_id: string | null;
}
