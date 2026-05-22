import { useUser } from "@clerk/expo";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { userProfileController } from "@/shared/api/supabase/controller";

export default function HomeLayout() {
	const { user } = useUser();

	useEffect(() => {
		if (!user) return;

		const syncSupabase = async () => {
			try {
				try {
					await userProfileController.getById(user.id);
				} catch (err) {
					if (err) console.error(err);

					const email =
						user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "";
					const name = user.fullName ?? user.firstName ?? "Unknown User";

					const googleAccount = user.externalAccounts.find((ea) => ea.provider === "google");
					const facebookAccount = user.externalAccounts.find((ea) => ea.provider === "facebook");

					await userProfileController.create({
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
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		/>
	);
}
