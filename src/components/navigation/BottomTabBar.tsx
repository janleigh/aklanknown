import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../Text";
import { TabIcon, type TabIconProps } from "./TabIcon";

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
		<SafeAreaView 
			edges={["bottom", "left", "right"]} 
			className="bg-canvas border-hairline border-t"
		>
			<View className="flex-row px-2" style={{ height: 56 }}>
				{tabs.map((tab) => {
					const isActive = activeTab === tab.key;
					return (
						<TouchableOpacity
							key={tab.key}
							className="flex-1 items-center justify-center"
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
								className={`text-xs mt-1 ${isActive ? "text-primary font-semibold" : "text-muted"}`}
								fontName="PlusJakartaSans_600SemiBold"
							>
								{tab.label}
							</Text>
						</TouchableOpacity>
					);
				})}
			</View>
		</SafeAreaView>
	);
}