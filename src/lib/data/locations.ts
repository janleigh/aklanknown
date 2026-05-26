import type { Location } from "@/types";

export interface MapLocation extends Location {
	latitude: number;
	longitude: number;
	reviews: number;
	description: string;
	fullDescription: string;
	images: string[];
}

export const LOCATION_LIST: MapLocation[] = [
	{
		id: "1",
		name: "Boracay White Beach",
		location: "Malay, Aklan",
		distance: "12 km away",
		rating: 4.9,
		image: "https://picsum.photos/seed/boracay/400/300",
		category: "Beaches",
		latitude: 11.9674,
		longitude: 121.925,
		reviews: 1245,
		description: "World-renowned white sand beach with crystal clear waters.",
		fullDescription:
			"Boracay White Beach is world-renowned for its pristine white sand and crystal clear turquoise waters. Stretching over 4 kilometers, it offers stunning sunsets, water activities, and vibrant nightlife. The beach is divided into three distinct stations, each with its own unique charm and atmosphere. Station 1 is known for luxury resorts, Station 2 for bustling D'Mall, and Station 3 for a relaxed, budget-friendly vibe.",
		images: [
			"https://picsum.photos/seed/boracay1/800/400",
			"https://picsum.photos/seed/boracay2/800/400",
			"https://picsum.photos/seed/boracay3/800/400",
		],
	},
	{
		id: "2",
		name: "Jawili Falls",
		location: "Tangalan, Aklan",
		distance: "28 km away",
		rating: 4.7,
		image: "https://picsum.photos/seed/jawili/400/300",
		category: "Parks",
		latitude: 11.9245,
		longitude: 122.212,
		reviews: 328,
		description: "Stunning multi-tiered waterfall surrounded by lush greenery.",
		fullDescription:
			"Jawili Falls is a stunning multi-tiered waterfall surrounded by lush greenery. The crystal-clear natural pools are perfect for swimming and relaxation. A hidden gem in Aklan, it offers a peaceful escape from the bustling beaches. The trek to the falls takes about 15-20 minutes through scenic forest trails.",
		images: [
			"https://picsum.photos/seed/jawili1/800/400",
			"https://picsum.photos/seed/jawili2/800/400",
		],
	},
	{
		id: "3",
		name: "Hinugtan Beach",
		location: "Buruanga, Aklan",
		distance: "45 km away",
		rating: 4.8,
		image: "https://picsum.photos/seed/hinugtan/400/300",
		category: "Beaches",
		latitude: 11.8347,
		longitude: 121.9034,
		reviews: 156,
		description: "Secluded paradise beach perfect for snorkeling and sunsets.",
		fullDescription:
			"Hinugtan Beach is a secluded paradise with powdery white sand and calm turquoise waters. Perfect for snorkeling and sunset watching, this hidden gem offers tranquility away from the crowds. The beach stretches for about 1 kilometer and is surrounded by coconut trees, providing natural shade.",
		images: [
			"https://picsum.photos/seed/hinugtan1/800/400",
			"https://picsum.photos/seed/hinugtan2/800/400",
		],
	},
	{
		id: "4",
		name: "Bakhawan Eco-Park",
		location: "Kalibo, Aklan",
		distance: "7 km away",
		rating: 4.6,
		image: "https://picsum.photos/seed/bakhawan/400/300",
		category: "Historical",
		latitude: 11.7089,
		longitude: 122.3817,
		reviews: 89,
		description: "Mangrove forest with hanging bridge and eco-trails.",
		fullDescription:
			"Bakhawan Eco-Park features a massive man-made forest with towering bamboo structures and hanging bridges. It's a favorite for nature walks, photography, and educational tours. The park spans 22 hectares and is a successful reforestation project that has become a major tourist attraction.",
		images: [
			"https://picsum.photos/seed/bakhawan1/800/400",
			"https://picsum.photos/seed/bakhawan2/800/400",
		],
	},
];

export const LOCATION_DETAILS_BY_ID = Object.fromEntries(
	LOCATION_LIST.map((location) => [location.id, location]),
) as Record<string, MapLocation>;

export const DEFAULT_MAP_LOCATION = LOCATION_LIST[0]!;

export const MOCK_REVIEWS = [
	{
		id: "1",
		userName: "Janleugggh",
		rating: 5,
		date: "Apr 6, 2026",
		comment:
			"Absolutely breathtaking! The sand is incredibly soft and the water is perfect for swimming.",
	},
	{
		id: "2",
		userName: "Pauleeenn",
		rating: 3,
		date: "May 29, 2026",
		comment: "Beautiful beach, but can get crowded during peak season. Still worth visiting!",
	},
];
