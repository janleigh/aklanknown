import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function RootScreen() {
	const router = useRouter();

	useEffect(() => {
		router.replace("/(landing)");
	}, [router]);

	return null;
}
