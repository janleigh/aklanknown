import { TextInput, type TextInputProps, View } from "react-native";
import { Text } from "./Text";

export interface InputProps extends TextInputProps {
	label?: string;
	error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
	return (
		<View className="w-full">
			{label && (
				<Text className="mb-2 ml-1 font-semibold text-ink" fontName="PlusJakartaSans_600SemiBold">
					{label}
				</Text>
			)}
			<View
				className={`bg-canvas border ${error ? "border-error" : "border-hairline"} rounded-lg px-4 py-3 flex-row items-center ${className || ""}`}
			>
				<TextInput
					{...props}
					className={`flex-1 text-ink ${props.placeholder ? "text-muted" : ""}`}
					placeholderTextColor="#929292"
				/>
			</View>
			{error && (
				<Text className="ml-1 mt-1 text-error text-sm" fontName="PlusJakartaSans_400Regular">
					{error}
				</Text>
			)}
		</View>
	);
}
