import { Search } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "../Text";
import { Button } from "../ui/Button";

export interface EmptyStateProps {
	title: string;
	description: string;
	actionLabel?: string;
	onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
	return (
		<View className="flex-1 items-center justify-center px-8 py-12">
			<View className="items-center justify-center mb-4 h-16 w-16 bg-primary/10 rounded-full">
				<Search size={32} color="#ff385c" />
			</View>
			<Text className="mb-2 text-center text-ink text-xl" fontName="PlusJakartaSans_700Bold">
				{title}
			</Text>
			<Text className="mb-6 text-center text-muted" fontName="PlusJakartaSans_400Regular">
				{description}
			</Text>
			{actionLabel && onAction && (
				<Button variant="primary" label={actionLabel} onPress={onAction} />
			)}
		</View>
	);
}
