// src/types/index.ts
export interface Location {
	id: string;
	name: string;
	location: string;
	distance: string;
	rating: number;
	image: string;
	category: string;
	description?: string;
}
export interface Event { id: string; title: string; date: string; time: string; location: string; description: string; image: string; }
export interface Review { id: string; userName: string; rating: number; date: string; comment: string; locationId?: string; }
export interface User { id: string; name: string; email: string; role: "guest" | "admin"; avatar?: string; }
export type UserRole = "guest" | "admin";