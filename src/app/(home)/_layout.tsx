import { useUser } from "@clerk/expo";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { HOME_TAB_ICONS, HOME_TAB_SCREEN_OPTIONS } from "@/components/navigation/HomeTabBar";
import { userController } from "@/lib/api/supabase/controller";

const TAB_SCREENS = [
	{ name: "index", label: "Home" },
	{ name: "maps", label: "Discover" },
	{ name: "bookmarks", label: "Bookmarks" },
	{ name: "profile", label: "Profile" },
	{ name: "settings", label: "Settings", hidden: true },
] as const;

export default function HomeLayout() {
	const { user } = useUser();

	useEffect(() => {
		if (!user) return;
		syncUserToSupabase(user);
	}, [user]);

	return (
		<Tabs screenOptions={HOME_TAB_SCREEN_OPTIONS}>
			{TAB_SCREENS.map((screen) => (
				<Tabs.Screen
					key={screen.name}
					name={screen.name}
					options={{
						title: screen.label,
						tabBarIcon: HOME_TAB_ICONS[screen.name as keyof typeof HOME_TAB_ICONS],
						...("hidden" in screen && screen.hidden && { href: null }),
					}}
				/>
			))}
		</Tabs>
	);
}

async function syncUserToSupabase(user: ReturnType<typeof useUser>["user"]) {
	try {
		const existingUser = await userController.getById(user!.id);
		if (existingUser) return;
	} catch (err) {
		console.error("Error checking user:", err);
	}

	try {
		const email =
			user!.primaryEmailAddress?.emailAddress ?? user!.emailAddresses[0]?.emailAddress ?? "";
		const name = user!.fullName ?? user!.firstName ?? "Unknown User";
		const googleAccount = user!.externalAccounts.find((ea) => ea.provider === "google");
		const facebookAccount = user!.externalAccounts.find((ea) => ea.provider === "facebook");

		await userController.create({
			id: user!.id,
			email,
			name,
			avatar_url: user!.imageUrl ?? "",
			google_id: googleAccount?.id ?? null,
			facebook_id: facebookAccount?.id ?? null,
			role: "user",
		});

		console.log("Supabase user profile synced.");
	} catch (error) {
		console.error("Error syncing to Supabase:", error);
	}
}
