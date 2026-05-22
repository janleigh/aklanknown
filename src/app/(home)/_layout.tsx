import { Tabs } from "expo-router";
import { Home, Map, Bookmark, User } from "lucide-react-native";

export default function HomeLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: "#ffffff",
					borderTopColor: "#ebebeb",
					borderTopWidth: 1,
					height: 80, // Taller height for mobile safety
					paddingBottom: 24, // Extra padding for iPhone Home Bar
					paddingTop: 8,
				},
				tabBarActiveTintColor: "#ff385c",
				tabBarInactiveTintColor: "#929292",
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: "600",
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => <Home size={24} color={color} fill="none" />,
				}}
			/>
			<Tabs.Screen
				name="maps"
				options={{
					title: "Maps",
					tabBarIcon: ({ color, focused }) => (
						<Map size={24} color={color} fill={focused ? "currentColor" : "none"} />
					),
				}}
			/>
			<Tabs.Screen
				name="bookmarks"
				options={{
					title: "Saved",
					tabBarIcon: ({ color, focused }) => (
						<Bookmark size={24} color={color} fill={focused ? "currentColor" : "none"} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color, focused }) => (
						<User size={24} color={color} fill={focused ? "currentColor" : "none"} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					href: null,
				}}
			/>
		</Tabs>
	);
}