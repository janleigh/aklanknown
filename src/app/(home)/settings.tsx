import { Bell, ChevronRight, Languages, MapPin, Moon } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Switch, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/Text";

export default function SettingsScreen() {
	const [notifications, setNotifications] = useState(true);
	const [location, setLocation] = useState(true);
	const [darkMode, setDarkMode] = useState(false);

	const items = [
		{
			icon: Bell,
			label: "Push Notifications",
			isSwitch: true,
			value: notifications,
			toggle: setNotifications,
		},
		{
			icon: MapPin,
			label: "Location Services",
			isSwitch: true,
			value: location,
			toggle: setLocation,
		},
		{ icon: Languages, label: "Language", value: "English", route: "/language" },
		{ icon: Moon, label: "Dark Mode", isSwitch: true, value: darkMode, toggle: setDarkMode },
	];

	return (
		<ScrollView className="flex-1 bg-surface-soft">
			<View className="pb-6 pt-12 px-4">
				<Text className="mb-1 text-2xl text-ink" fontName="PlusJakartaSans_700Bold">
					Settings
				</Text>
				<Text className="text-muted" fontName="PlusJakartaSans_400Regular">
					Customize your experience
				</Text>
			</View>

			<View className="overflow-hidden mx-4 bg-canvas border border-hairline rounded-xl shadow-sm">
				{items.map((item, i) => {
					const Icon = item.icon;
					const isClickable = !item.isSwitch && item.route;

					const content = (
						<>
							<View className="flex-1 flex-row items-center">
								<View className="items-center justify-center mr-4 h-10 w-10 bg-primary/10 rounded-full">
									<Icon size={20} color="#ff385c" />
								</View>
								<Text
									className="flex-1 font-semibold text-ink"
									fontName="PlusJakartaSans_600SemiBold"
								>
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
								<View className="flex-row gap-1 items-center">
									<Text className="mr-1 text-muted-soft" fontName="PlusJakartaSans_400Regular">
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
									className="flex-1 flex-row items-center justify-between"
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
