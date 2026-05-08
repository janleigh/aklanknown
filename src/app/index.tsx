import { Text, View } from "react-native";

export default function LandingScreen() {
	return (
		<View
			style={{
				justifyContent: "center",
				alignItems: "center",
				height: "100%",
			}}
		>
			<Text
				style={{
					fontSize: 24,
					fontWeight: "bold",
				}}
			>
				Hello, world!
			</Text>
		</View>
	);
}
