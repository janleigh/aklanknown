
import { TextInput, TextInputProps, View } from "react-native";
import { Text } from "../Text";

export interface InputProps extends TextInputProps {
	label?: string;
	error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
	return (
		<View className="w-full">
			{label && (
				<Text className="text-ink font-semibold mb-2 ml-1" fontName="PlusJakartaSans_600SemiBold">
					{label}
				</Text>
			)}
			<View className={`bg-canvas border ${error ? "border-error" : "border-hairline"} rounded-lg px-4 py-3 flex-row items-center ${className || ""}`}>
				<TextInput
					{...props}
					className={`flex-1 text-ink ${props.placeholder ? "text-muted" : ""}`}
					placeholderTextColor="#929292"
				/>
			</View>
			{error && (
				<Text className="text-error text-sm mt-1 ml-1" fontName="PlusJakartaSans_400Regular">
					{error}
				</Text>
			)}
		</View>
	);
}