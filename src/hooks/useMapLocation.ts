import { useEffect, useState } from "react";
import { locationController } from "@/shared/api/supabase";
import { Location as SupabaseLocation } from "@/shared/types/supabase";
import { Location } from "@/types/map";

interface UseMapLocationReturn {
	location: Location | null;
	loading: boolean;
	error: string | null;
}

export const useMapLocation = (locationId?: string): UseMapLocationReturn => {
	const [location, setLocation] = useState<Location | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!locationId) {
			setLoading(false);
			setError("No location ID provided");
			return;
		}

		const fetchLocation = async () => {
			try {
				setLoading(true);
				setError(null);

				const data = await locationController.getById(locationId);

				if (!data) {
					setError("Location not found");
					setLocation(null);
					return;
				}

				const location: Location = {
					id: data.id,
					name: data.name,
					coordinates: {
						latitude: data.latitude,
						longitude: data.longitude,
					},
				};

				setLocation(location);
			} catch (err) {
				console.error("Error fetching location:", err);
				setError(
					err instanceof Error ? err.message : "Failed to fetch location"
				);
				setLocation(null);
			} finally {
				setLoading(false);
			}
		};

		fetchLocation();
	}, [locationId]);

	return { location, loading, error };
};
