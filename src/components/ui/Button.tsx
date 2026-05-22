
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Text } from "../Text";

export interface ButtonProps extends TouchableOpacityProps {
	variant?: "primary" | "secondary" | "outline";
	size?: "sm" | "md" | "lg";
	label: string;
	disabled?: boolean;
}

export function Button({
	variant = "primary",
	size = "md",
	label,
	disabled,
	className,
	...props
}: ButtonProps) {
	const variants: Record<string, string> = {
		primary: "bg-primary active:bg-primary-active",
		secondary: "bg-surface-strong active:bg-surface-soft",
		outline: "bg-canvas border border-hairline active:bg-surface-soft",
	};
	const sizes: Record<string, string> = {
		sm: "h-9 px-4",
		md: "h-11 px-6",
		lg: "h-14 px-8",
	};
	const textColors: Record<string, string> = {
		primary: "text-on-primary",
		secondary: "text-ink",
		outline: "text-ink",
	};

	return (
		<TouchableOpacity
			{...props}
			className={`${variants[variant]} ${sizes[size]} rounded-lg flex-row items-center justify-center active:scale-98 ${disabled ? "opacity-50" : ""} ${className || ""}`}
			disabled={disabled}
		>
			<Text className={`${textColors[variant]} font-semibold`} fontName="PlusJakartaSans_600SemiBold">
				{label}
			</Text>
		</TouchableOpacity>
	);
}