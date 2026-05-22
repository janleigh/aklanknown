
import { SafeAreaView as RNSafeAreaView, SafeAreaViewProps, Edge } from "react-native-safe-area-context";

export interface SafeAreaProps extends SafeAreaViewProps {
	className?: string;
	edges?: Edge[];
}

export function SafeArea({ className, edges = ["top", "bottom", "left", "right"], style, ...props }: SafeAreaProps) {
	return (
		<RNSafeAreaView
			edges={edges}
			className={className}
			style={style}
			{...props}
		/>
	);
}