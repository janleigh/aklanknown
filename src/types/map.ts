export interface MapConfig {
	container: string;
	style: string;
	center: [number, number];
	zoom: number;
	pitch?: number;
	bearing?: number;
	minZoom?: number;
	maxZoom?: number;
	interactive?: boolean;
}

export interface DirectionsOptions {
	accessToken: string;
	unit: "metric" | "imperial";
	profile: "mapbox/driving" | "mapbox/driving-traffic" | "mapbox/walking" | "mapbox/cycling";
	controls: {
		inputs: boolean;
		instructions: boolean;
	};
	placeholderOrigin: string;
	placeholderDestination: string;
	geocoder?: {
		language: string;
	};
}

export interface WebViewMessage {
	type: "getLocation" | "mapLoaded";
	data?: any;
}

export interface MapState {
	directionsVisible: boolean;
	userLocation: UserLocation | null;
	mapReady: boolean;
	currentRoute?: any;
}

export interface Location {
	id: string;
	name: string;
	coordinates: {
		latitude: number;
		longitude: number;
	};
}

export interface UserLocation {
	latitude: number;
	longitude: number;
}

export interface MapViewModalProps {
	visible: boolean;
	onClose: () => void;
	location: Location;
}
