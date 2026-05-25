import { Search } from "lucide-react-native";
import { TextInput, View } from "react-native";

export interface SearchBarProps {
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
}

export function SearchBar({
	value,
	onChangeText,
	placeholder = "Where to in Aklan?",
}: SearchBarProps) {
	return (
		<View className="flex-row items-center px-4 py-3 bg-canvas border border-hairline rounded-full shadow-sm">
			<Search size={20} color="#929292" />
			<TextInput
				className="flex-1 ml-3 text-ink"
				placeholder={placeholder}
				placeholderTextColor="#929292"
				value={value}
				onChangeText={onChangeText}
			/>
		</View>
	);
}
