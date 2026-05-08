// biome-ignore assist/source/organizeImports: bugged
import { Text } from "@/components/Text";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import { Link } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

export default function LandingPage() {
	return (
		<ScrollView
			className="flex-1 bg-white"
			contentContainerClassName="grow justify-center px-6"
			showsVerticalScrollIndicator={false}
		>
			<View className="w-full max-w-100 mx-auto">
				<View className="space-y-3 mb-12">
					<Text className="text-4xl text-gray-900 tracking-tight" fontName="Geist_700Bold">
						AklanKnown
					</Text>
					<Text className="text-lg text-gray-600" fontName="Geist_400Regular">
						Discover the untold beauty of Aklan.
					</Text>
				</View>

				{/* SSO */}
				{/* TODO!: Use icons */}
				<View className="space-y-3 mb-12">
					<Pressable className="w-full h-11 bg-primary hover:bg-primary-active rounded-lg active:scale-98 flex-row items-center justify-center space-x-2 shadow-sm">
						<AntDesign name="google" size={20} color="white" />
						<Text className="text-white text-base" fontName="Geist_600SemiBold">
							Continue with Google
						</Text>
					</Pressable>

					<Pressable className="w-full h-11 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg active:scale-98 flex-row items-center justify-center space-x-2">
						<Entypo name="facebook" size={20} color="black" />
						<Text className="text-gray-900 text-base" fontName="Geist_600SemiBold">
							Continue with Facebook
						</Text>
					</Pressable>

					{/* Guest */}
					<View className="pt-2 flex justify-center">
						<Pressable>
							<Text
								className="text-gray-600 hover:text-gray-900 text-sm text-center"
								fontName="Geist_400Regular"
							>
								Continue as Guest
							</Text>
						</Pressable>
					</View>
				</View>

				{/* Legal / Footer */}
				<View className="space-y-4 pt-8">
					<Text className="text-sm text-gray-600 text-center leading-relaxed">
						By signing up, you agree to our{" "}
						<Link href="/" asChild>
							<Pressable>
								<Text className="text-gray-900 underline" fontName="Geist_600SemiBold">
									Terms of Service
								</Text>
							</Pressable>
						</Link>{" "}
						and{" "}
						<Link href="/" asChild>
							<Pressable>
								<Text className="text-gray-900 underline" fontName="Geist_600SemiBold">
									Privacy Policy
								</Text>
							</Pressable>
						</Link>
						.
					</Text>
				</View>
			</View>
		</ScrollView>
	);
}
