import { supabase } from "@/shared/api/supabase/supabase";
import type {
	Bookmark,
	CachedRoute,
	Event,
	Location,
	LocationImage,
	Product,
	ProductImage,
	Review,
	UserProfile,
} from "@/shared/types/supabase";

type Identifier = string | number;

type BaseRecord = {
	id: Identifier;
	created_at?: string | null;
};

export type CreatePayload<T extends BaseRecord> = Omit<T, "id" | "created_at">;
export type UpdatePayload<T extends BaseRecord> = Partial<CreatePayload<T>>;

export type ListOptions<T extends BaseRecord> = {
	orderBy?: Extract<keyof T, string>;
	ascending?: boolean;
	limit?: number;
};

export type CrudController<T extends BaseRecord> = {
	list: (options?: ListOptions<T>) => Promise<T[]>;
	getById: (id: T["id"]) => Promise<T>;
	create: (payload: CreatePayload<T>) => Promise<T>;
	update: (id: T["id"], payload: UpdatePayload<T>) => Promise<T>;
	remove: (id: T["id"]) => Promise<T>;
};

const buildCrudController = <T extends BaseRecord>(tableName: string): CrudController<T> => ({
	list: async (options) => {
		let query = supabase.from(tableName).select("*");

		if (options?.orderBy) {
			query = query.order(options.orderBy, {
				ascending: options.ascending ?? false,
			});
		}

		if (options?.limit) {
			query = query.limit(options.limit);
		}

		const { data, error } = await query;

		if (error) {
			throw error;
		}

		return (data ?? []) as T[];
	},
	getById: async (id) => {
		const { data, error } = await supabase.from(tableName).select("*").eq("id", id).single();

		if (error) {
			throw error;
		}

		return data as T;
	},
	create: async (payload) => {
		const { data, error } = await supabase.from(tableName).insert(payload).select("*").single();

		if (error) {
			throw error;
		}

		return data as T;
	},
	update: async (id, payload) => {
		const { data, error } = await supabase
			.from(tableName)
			.update(payload)
			.eq("id", id)
			.select("*")
			.single();

		if (error) {
			throw error;
		}

		return data as T;
	},
	remove: async (id) => {
		const { data, error } = await supabase
			.from(tableName)
			.delete()
			.eq("id", id)
			.select("*")
			.single();

		if (error) {
			throw error;
		}

		return data as T;
	},
});

export const bookmarkController = buildCrudController<Bookmark>("bookmarks");
export const cachedRouteController = buildCrudController<CachedRoute>("cached_routes");
export const eventController = buildCrudController<Event>("events");
export const locationController = buildCrudController<Location>("locations");
export const locationImageController = buildCrudController<LocationImage>("location_images");
export const productController = buildCrudController<Product>("products");
export const productImageController = buildCrudController<ProductImage>("product_images");
export const reviewController = buildCrudController<Review>("reviews");
export const userProfileController = buildCrudController<UserProfile>("user_profiles");

export const controllers = {
	bookmark: bookmarkController,
	cachedRoute: cachedRouteController,
	event: eventController,
	location: locationController,
	locationImage: locationImageController,
	product: productController,
	productImage: productImageController,
	review: reviewController,
	userProfile: userProfileController,
};
