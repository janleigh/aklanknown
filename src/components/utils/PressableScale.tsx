
import { TouchableOpacity, TouchableOpacityProps, Animated } from "react-native";
import { useRef } from "react";

export interface PressableScaleProps extends TouchableOpacityProps {
	scaleValue?: number;
}

export function PressableScale({
	className,
	scaleValue = 0.98,
	onPressIn,
	onPressOut,
	style,
	...props
}: PressableScaleProps) {
	const scaleAnim = useRef(new Animated.Value(1)).current;

	const handlePressIn = (e: any) => {
		Animated.spring(scaleAnim, {
			toValue: scaleValue,
			useNativeDriver: true,
		}).start();
		onPressIn?.(e);
	};

	const handlePressOut = (e: any) => {
		Animated.spring(scaleAnim, {
			toValue: 1,
			useNativeDriver: true,
		}).start();
		onPressOut?.(e);
	};

	return (
		<Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
			<TouchableOpacity
				{...props}
				className={className}
				style={style}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
			/>
		</Animated.View>
	);
}