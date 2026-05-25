export const API_KEYS = {
	mapbox: process.env.EXPO_PUBLIC_MAPBOX_APIKEY ?? "",
	clerk: {
		publishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
	},
	supabase: {
		url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
		publishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
	},
};
