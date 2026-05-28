import { Bookmark, Home, Map as MapIcon, User } from "lucide-react-native";

export const HOME_TAB_SCREEN_OPTIONS = {
	headerShown: false,
	tabBarStyle: {
		backgroundColor: "#ffffff",
		position: "absolute",
		bottom: 24,
		left: 24,
		right: 24,
		borderRadius: 32,
		height: 64,
		paddingBottom: 0,
		paddingTop: 0,
		borderTopWidth: 0,
		elevation: 8,
		shadowColor: "#000000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
	},
	tabBarItemStyle: {
		paddingVertical: 8,
	},
	tabBarActiveTintColor: "#ff385c",
	tabBarInactiveTintColor: "#929292",
	tabBarLabelStyle: {
		fontSize: 10,
		fontWeight: "600",
		marginTop: 4,
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
