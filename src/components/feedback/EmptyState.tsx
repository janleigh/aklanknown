
import { View } from "react-native";
import { Search } from "lucide-react-native";
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
			<View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
				<Search size={32} color="#ff385c" />
			</View>
			<Text className="text-xl text-ink mb-2 text-center" fontName="PlusJakartaSans_700Bold">
				{title}
			</Text>
			<Text className="text-muted text-center mb-6" fontName="PlusJakartaSans_400Regular">
				{description}
			</Text>
			{actionLabel && onAction && <Button variant="primary" label={actionLabel} onPress={onAction} />}
		</View>
	);
}