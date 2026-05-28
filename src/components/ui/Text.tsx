// src/components/Text.tsx
import { Text as RNText, type TextProps as RNTextProps } from "react-native";

export interface TextProps extends RNTextProps {
	fontName?: string;
}

export function Text({ fontName, className, style, children, ...props }: TextProps) {
	return (
		<RNText {...props} className={className} style={[fontName && { fontFamily: fontName }, style]}>
			{children}
		</RNText>
	);
}
