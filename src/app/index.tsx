import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";

export default function RootScreen() {
	const { isSignedIn, isLoaded } = useAuth();

	if (!isLoaded) {
		return null;
	}

	if (isSignedIn) {
		return <Redirect href="/(home)" />;
	}

	return <Redirect href="/(landing)" />;
}
