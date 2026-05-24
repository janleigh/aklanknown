import { useUser } from "@clerk/expo";
import { Stack, Tabs } from "expo-router";
import { Bookmark, Home, Map as MapIcon, User } from "lucide-react-native";
import { useEffect } from "react";
import { userController } from "@/shared/api/supabase/controller";

export default function HomeLayout() {
	const { user } = useUser();

	useEffect(() => {
		if (!user) return;

		const syncSupabase = async () => {
			try {
				try {
					await userController.getById(user.id);
				} catch (err) {
					if (err) console.error(err);

					const email =
						user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "";
					const name = user.fullName ?? user.firstName ?? "Unknown User";

					const googleAccount = user.externalAccounts.find((ea) => ea.provider === "google");
					const facebookAccount = user.externalAccounts.find((ea) => ea.provider === "facebook");

					await userController.create({
						id: user.id,
						email,
						name,
						avatar_url: user.imageUrl ?? "",
						google_id: googleAccount?.id ?? null,
						facebook_id: facebookAccount?.id ?? null,
						role: "user",
					});
					console.log("Supabase user profile synced.");
				}
			} catch (error) {
				console.error("Error syncing to Supabase:", error);
			}
		};

		syncSupabase();
	}, [user]);

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
						<MapIcon size={24} color={color} fill={focused ? "currentColor" : "none"} />
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
