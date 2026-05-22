
import { useState } from "react";
import { View, ScrollView, Switch, TouchableOpacity } from "react-native";
import { ChevronRight, Moon, Bell, MapPin, Languages } from "lucide-react-native";
import { Text } from "@/components/Text";

export default function SettingsScreen() {
	const [notifications, setNotifications] = useState(true);
	const [location, setLocation] = useState(true);
	const [darkMode, setDarkMode] = useState(false);

	const items = [
		{ icon: Bell, label: "Push Notifications", isSwitch: true, value: notifications, toggle: setNotifications },
		{ icon: MapPin, label: "Location Services", isSwitch: true, value: location, toggle: setLocation },
		{ icon: Languages, label: "Language", value: "English", route: "/language" },
		{ icon: Moon, label: "Dark Mode", isSwitch: true, value: darkMode, toggle: setDarkMode },
	];

	return (
		<ScrollView className="flex-1 bg-surface-soft">
			<View className="px-4 pt-12 pb-6">
				<Text className="text-2xl text-ink mb-1" fontName="PlusJakartaSans_700Bold">Settings</Text>
				<Text className="text-muted" fontName="PlusJakartaSans_400Regular">Customize your experience</Text>
			</View>

			<View className="bg-canvas mx-4 rounded-xl overflow-hidden shadow-sm border border-hairline">
				{items.map((item, i) => {
					const Icon = item.icon;
					const isClickable = !item.isSwitch && item.route;
					
					const content = (
						<>
							<View className="flex-row items-center flex-1">
								<View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-4">
									<Icon size={20} color="#ff385c" />
								</View>
								<Text className="font-semibold text-ink flex-1" fontName="PlusJakartaSans_600SemiBold">
									{item.label}
								</Text>
							</View>
							{item.isSwitch ? (
								<Switch
									value={item.value as boolean}
									onValueChange={item.toggle as (v: boolean) => void}
									trackColor={{ false: "#ebebeb", true: "#ff385c" }}
									thumbColor="#ffffff"
								/>
							) : (
								<View className="flex-row items-center gap-1">
									<Text className="text-muted-soft mr-1" fontName="PlusJakartaSans_400Regular">
										{item.value as string}
									</Text>
									<ChevronRight size={20} color="#929292" />
								</View>
							)}
						</>
					);

					return (
						<View
							key={i}
							className={`flex-row items-center justify-between p-4 ${
								i < items.length - 1 ? "border-b border-hairline" : ""
							} ${isClickable ? "active:bg-surface-soft" : ""}`}
						>
							{isClickable ? (
								<TouchableOpacity
									className="flex-row items-center justify-between flex-1"
									onPress={() => console.log("Navigate:", item.route)}
									activeOpacity={0.7}
								>
									{content}
								</TouchableOpacity>
							) : (
								content
							)}
						</View>
					);
				})}
			</View>
		</ScrollView>
	);
}