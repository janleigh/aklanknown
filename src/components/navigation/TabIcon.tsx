
import { View } from "react-native";
import { LucideIcon } from "lucide-react-native";

export interface TabIconProps {
	icon: LucideIcon;
	size?: number;
	color: string;
	fill?: "none" | "currentColor";
}

export function TabIcon({ icon: Icon, size = 24, color, fill = "none" }: TabIconProps) {
	return (
		<View className="items-center justify-center">
			<Icon size={size} color={color} fill={fill} />
		</View>
	);
}