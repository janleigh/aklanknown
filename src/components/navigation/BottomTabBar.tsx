
import { View, TouchableOpacity } from "react-native";
import { Text } from "../Text";
import { TabIcon, TabIconProps } from "./TabIcon";

export interface BottomTabBarProps {
	tabs: Array<{
		key: string;
		label: string;
		icon: TabIconProps["icon"];
		onPress: () => void;
	}>;
	activeTab: string;
}

export function BottomTabBar({ tabs, activeTab }: BottomTabBarProps) {
	return (
		<View className="flex-row pb-safe pt-2 px-2 bg-canvas border-hairline border-t">
			{tabs.map((tab) => {
				const isActive = activeTab === tab.key;
				return (
					<TouchableOpacity
						key={tab.key}
						className="flex-1 items-center justify-center py-2"
						onPress={tab.onPress}
						activeOpacity={0.7}
					>
						<TabIcon
							icon={tab.icon}
							size={24}
							color={isActive ? "#ff385c" : "#929292"}
							fill={isActive ? "currentColor" : "none"}
						/>
						<Text
							className={`text-xs mt-1 ${
								isActive ? "text-primary font-semibold" : "text-muted"
							}`}
							fontName="PlusJakartaSans_600SemiBold"
						>
							{tab.label}
						</Text>
					</TouchableOpacity>
				);
			})}
		</View>
	);
}