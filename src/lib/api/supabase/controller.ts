import { supabase } from "@/lib/api/supabase/supabase";
import type {
	Bookmark,
	CachedRoute,
	Location,
	LocationImage,
	Review,
	UserProfile,
} from "@/lib/types/supabase";

type Identifier = string | number;

type BaseRecord = {
	id: Identifier;
	created_at?: string | null;
};

export type CreatePayload<T extends BaseRecord> = Omit<T, "created_at" | "id"> & { id?: T["id"] };
export type UpdatePayload<T extends BaseRecord> = Partial<Omit<T, "created_at" | "id">>;

export type ListOptions<T extends BaseRecord> = {
	orderBy?: Extract<keyof T, string>;
	ascending?: boolean;
	limit?: number;
};

export type Controller<T extends BaseRecord> = {
	list: (options?: ListOptions<T>) => Promise<T[]>;
	getById: (id: T["id"]) => Promise<T>;
	create: (payload: CreatePayload<T>) => Promise<T>;
	update: (id: T["id"], payload: UpdatePayload<T>) => Promise<T>;
	remove: (id: T["id"]) => Promise<T>;
};

const buildController = <T extends BaseRecord>(tableName: string): Controller<T> => ({
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
		const { data, error } = await supabase
			.from(tableName)
			.insert(payload as never)
			.select("*")
			.single();

		if (error) {
			throw error;
		}

		return data as T;
	},
	update: async (id, payload) => {
		const { data, error } = await supabase
			.from(tableName)
			.update(payload as never)
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

export const bookmarkController = buildController<Bookmark>("bookmarks");
export const cachedRouteController = buildController<CachedRoute>("cached_routes");
export const locationController = buildController<Location>("locations");
export const locationImageController = buildController<LocationImage>("location_images");
const _reviewControllerBase = buildController<Review>("reviews");

// Wrap the generated review controller to sanitize incoming auth IDs that
// are not native DB UUIDs (for example Clerk IDs like "user_..."), which
// would otherwise cause "invalid input syntax for type uuid" errors if the
// `reviews.user_id` column is a uuid type in the database. If an incoming
// user_id looks like an external auth id, store null instead.
export const reviewController = {
	..._reviewControllerBase,
	create: async (payload: any) => {
		const safePayload = { ...payload };
		if (typeof safePayload.user_id === "string" && safePayload.user_id.startsWith("user_")) {
			safePayload.user_id = null;
		}

		return _reviewControllerBase.create(safePayload);
	},
};
export const userController = buildController<UserProfile>("users");

export const controllers = {
	bookmark: bookmarkController,
	cachedRoute: cachedRouteController,
	location: locationController,
	locationImage: locationImageController,
	review: reviewController,
	user: userController,
};
