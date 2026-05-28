import { Bookmark, Home, Map as MapIcon, User } from "lucide-react-native";

export const HOME_TAB_SCREEN_OPTIONS = {
	headerShown: false,
	tabBarStyle: {
		backgroundColor: "#ffffff",
		borderTopWidth: 1,
		borderTopColor: "#e5e5e5",
		paddingBottom: 24,
		paddingTop: 8,
		height: 80,
	},
	tabBarItemStyle: {
		paddingVertical: 8,
	},
	tabBarActiveTintColor: "#ff385c",
	tabBarInactiveTintColor: "#929292",
	tabBarLabelStyle: {
		fontSize: 10,
		fontWeight: "600",
	},
} as const;

export const HOME_TAB_ICONS = {
	index: ({ color }: { color: string }) => <Home size={24} color={color} fill="none" />,
	maps: ({ color, focused }: { color: string; focused: boolean }) => (
		<MapIcon size={24} color={color} fill={focused ? "currentColor" : "none"} />
	),
	bookmarks: ({ color, focused }: { color: string; focused: boolean }) => (
		<Bookmark size={24} color={color} fill={focused ? "currentColor" : "none"} />
	),
	profile: ({ color, focused }: { color: string; focused: boolean }) => (
		<User size={24} color={color} fill={focused ? "currentColor" : "none"} />
	),
} as const;
