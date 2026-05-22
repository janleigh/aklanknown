
import { View, ViewProps } from "react-native";

export interface CardProps extends ViewProps {
	variant?: "default" | "elevated" | "outlined";
}

export function Card({ variant = "default", className, ...props }: CardProps) {
	const variants: Record<string, string> = {
		default: "bg-canvas border border-hairline",
		elevated: "bg-canvas shadow-sm",
		outlined: "bg-canvas border-2 border-primary/20",
	};

	return (
		<View className={`rounded-xl p-4 ${variants[variant]} ${className || ""}`} {...props} />
	);
}