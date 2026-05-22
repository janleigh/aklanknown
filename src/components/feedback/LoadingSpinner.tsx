
import { ActivityIndicator, View } from "react-native";

export interface LoadingSpinnerProps {
	size?: "small" | "large";
	color?: string;
	className?: string;
}

export function LoadingSpinner({ size = "large", color = "#ff385c", className }: LoadingSpinnerProps) {
	return (
		<View className={`items-center justify-center ${className || ""}`}>
			<ActivityIndicator size={size} color={color} />
		</View>
	);
}