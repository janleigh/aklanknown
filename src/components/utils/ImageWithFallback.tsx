
import { Image, ImageProps, View } from "react-native";
import { useState } from "react";

export interface ImageWithFallbackProps extends ImageProps {
	fallbackSource?: number | { uri: string };
	fallbackComponent?: React.ReactNode;
}

export function ImageWithFallback({
	source,
	fallbackSource,
	fallbackComponent,
	className,
	style,
	...props
}: ImageWithFallbackProps) {
	const [error, setError] = useState(false);

	if (error && fallbackComponent) {
		return fallbackComponent;
	}

	return (
		<Image
			{...props}
			source={error && fallbackSource ? fallbackSource : source}
			className={className}
			style={style}
			onError={() => setError(true)}
		/>
	);
}