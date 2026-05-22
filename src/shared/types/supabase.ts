type Role = "user" | "admin";

export interface Bookmark {
	id: string;
	created_at: string;
	location_id: string | null;
	user_id: string | null;
}

export interface CachedRoute {
	id: string;
	location_id: string | null;
	route_data: string;
	distance_m: number | null;
	distance_s: number | null;
	cached_at: string;
}

export interface LocationImage {
	id: string;
	location_id: string | null;
	image_url: string;
	created_at: string;
}

export interface Location {
	id: string;
	name: string;
	description_en: string | null;
	description_tl: string | null;
	description_akl: string | null;
	street: string;
	barangay: string;
	town: string;
	latitude: number | null;
	longitude: number | null;
	banner_image_url: string;
	panorama_image: string;
	created_at: string;
}

export interface Review {
	id: string;
	location_id: string | null;
	user_id: string | null;
	rating: number | null;
	comment: string | null;
	is_flagged: boolean | null;
	created_at: string;
}

export interface UserProfile {
	id: string;
	google_id: string | null;
	facebook_id: string | null;
	name: string;
	email: string;
	avatar_url: string;
	role: Role;
	created_at: string | null;
}
