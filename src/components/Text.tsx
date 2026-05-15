import type { PropsWithChildren } from "react";
import type { TextProps as BaseTP } from "react-native";
import { Text as BaseT } from "react-native";

type FontNames =
	| "Geist_400Regular"
	| "Geist_500Medium"
	| "Geist_600SemiBold"
	| "Geist_700Bold"
	| "PlusJakartaSans_400Regular"
	| "PlusJakartaSans_500Medium"
	| "PlusJakartaSans_600SemiBold"
	| "PlusJakartaSans_700Bold";

type TextProps = PropsWithChildren<
	BaseTP & {
		className: string;
		fontName?: FontNames;
		fontStyle?: "regular" | "medium" | "bold" | "extrabold";
	}
>;

export const Text = ({
	children,
	className = "",
	numberOfLines,
	fontName,
	fontStyle,
	...rest
}: TextProps) => {
	fontName = fontName ?? "Geist_400Regular";
	const weightClass = fontStyle ? `-${fontStyle}` : "";
	return (
		<BaseT
			className={`font-${weightClass} ${className}`.trim()}
			numberOfLines={numberOfLines}
			style={fontName ? { fontFamily: fontName } : {}}
			{...rest}
		>
			{children}
		</BaseT>
	);
};
