
import { TouchableOpacity } from "react-native";
import { Text } from "../Text";

export interface CategoryPillProps {
	label: string;
	isActive?: boolean;
	onPress?: () => void;
}

export function CategoryPill({ label, isActive = false, onPress }: CategoryPillProps) {
	return (
		<TouchableOpacity
			className={`px-5 py-2 rounded-full mr-3 ${
				isActive ? "bg-primary" : "bg-canvas border border-hairline"
			}`}
			onPress={onPress}
			activeOpacity={0.7}
		>
			<Text
				className={`font-semibold ${isActive ? "text-on-primary" : "text-ink"}`}
				fontName="PlusJakartaSans_600SemiBold"
			>
				{label}
			</Text>
		</TouchableOpacity>
	);
}