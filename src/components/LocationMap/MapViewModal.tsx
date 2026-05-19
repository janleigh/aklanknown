import {
	SafeAreaView,
	View,
	Modal,
	TouchableOpacity,
	Text,
	ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import * as ELocation from "expo-location";
import { API_KEYS } from "@/config";
import React, { useRef, useState, useEffect } from "react";
import { Feather } from "@expo/vector-icons";
import { MapViewModalProps, WebViewMessage } from "@/types/map";

export const MapViewModal: React.FC<MapViewModalProps> = ({
	visible,
	onClose,
	location,
}) => {
	const webViewRef = useRef<WebView>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [permissionGranted, setPermissionGranted] = useState(false);

	useEffect(() => {
		if (visible) {
			requestLocationPermission();
			setIsLoading(true);
		}
	}, [visible]);

	const requestLocationPermission = async () => {
		try {
			const { status } = await ELocation.requestForegroundPermissionsAsync();
			setPermissionGranted(status === "granted");
		} catch (error) {
			console.error("Error requesting location permission:", error);
		}
	};

	const getMapHTML = () => {
		const { longitude, latitude } = location.coordinates;
		const mapboxToken = API_KEYS.mapbox;

		return `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
				<link rel="preconnect" href="https://fonts.googleapis.com">
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
				<link href="https://fonts.googleapis.com/css2?family=Lexend+Mega:wght@100..900&display=swap" rel="stylesheet">

				<!-- Mapbox GL -->
				<link href="https://api.mapbox.com/mapbox-gl-js/v3.13.0/mapbox-gl.css" rel="stylesheet">
				<script src="https://api.mapbox.com/mapbox-gl-js/v3.13.0/mapbox-gl.js"><\/script>

				<!-- Directions Plugin -->
				<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.1.1/mapbox-gl-directions.css" type="text/css">
				<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.1.1/mapbox-gl-directions.js"><\/script>

				<style>
					* {
						margin: 0;
						padding: 0;
						box-sizing: border-box;
					}

					body { 
						margin: 0; 
						padding: 0; 
						overflow: hidden;
					}

					#map { 
						position: absolute; 
						top: 0; 
						bottom: 0; 
						width: 100%; 
					}

					.destination-info {
						position: absolute;
						bottom: 10px;
						left: 10px;
						background: #161719;
						padding: 10px;
						border-radius: 4px;
						z-index: 1;
						max-width: 300px;
						font-family: 'Lexend Mega', sans-serif;
						letter-spacing: -0.15em;
						box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
						border: 1px solid #333333;
						margin-bottom: 1.75em;
					}

					.destination-info h3 {
						margin: 0;
						font-size: 16px;
						color: #f7f7f7;
					}

					.directions-toggle {
						position: absolute;
						bottom: 24px;
						left: 50%;
						transform: translateX(-50%);
						z-index: 5;
						background: #0ff6be;
						color: #161719;
						border: none;
						border-radius: 999px;
						padding: 10px 20px;
						font-family: 'Lexend Mega', sans-serif;
						font-size: 12px;
						letter-spacing: -0.05em;
						cursor: pointer;
						box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
						transition: all 0.2s ease;
					}

					.directions-toggle:hover {
						background: #00d4a3;
					}

					.directions-toggle:active {
						transform: translateX(-50%) scale(0.97);
					}

					.mapbox-directions-instructions.collapsible,
					.directions-control-instructions.collapsible {
						max-width: 320px;
						max-height: 60vh;
						overflow-y: auto;
					}

					.mapbox-directions-instructions.collapsible.collapsed,
					.directions-control-instructions.collapsible.collapsed {
						display: none !important;
					}
				</style>
			</head>
			<body>
				<div id="map"><\/div>
				<div class="destination-info">
					<h3 id="dest-name">${location.name}<\/h3>
				</div>
				<button id="toggle-directions" class="directions-toggle" aria-expanded="false" type="button">
					Show Directions
				</button>

				<script>
					// ========== INITIALIZATION ==========
					mapboxgl.accessToken = '${mapboxToken}';
					
					const destinationCoords = [${longitude}, ${latitude}];
					const destNameElement = document.getElementById('dest-name');
					const toggleButton = document.getElementById('toggle-directions');
					
					let directions;
					let instructionsContainer = null;
					let instructionsVisible = false;

					// ========== DIRECTIONS TOGGLE ==========
					const updateInstructionsVisibility = () => {
						if (!instructionsContainer || !toggleButton) return;
						
						if (instructionsVisible) {
							instructionsContainer.classList.remove('collapsed');
							toggleButton.textContent = 'Hide Directions';
							toggleButton.setAttribute('aria-expanded', 'true');
						} else {
							instructionsContainer.classList.add('collapsed');
							toggleButton.textContent = 'Show Directions';
							toggleButton.setAttribute('aria-expanded', 'false');
						}
					};

					const initializeInstructionsToggle = () => {
						if (!toggleButton) return;
						
						const nextContainer = document.querySelector('.mapbox-directions-instructions')
							|| document.querySelector('.directions-control-instructions');
						
						if (!nextContainer) {
							setTimeout(initializeInstructionsToggle, 100);
							return;
						}
						
						if (instructionsContainer !== nextContainer) {
							instructionsContainer = nextContainer;
							instructionsContainer.classList.add('collapsible');
							updateInstructionsVisibility();
							return;
						}
						
						updateInstructionsVisibility();
					};

					if (toggleButton) {
						toggleButton.addEventListener('click', () => {
							instructionsVisible = !instructionsVisible;
							updateInstructionsVisibility();
						});
					}

					// ========== MAP CREATION ==========
					const map = new mapboxgl.Map({
						container: 'map',
						style: 'mapbox://styles/mapbox/streets-v12',
						center: destinationCoords,
						zoom: 15,
						pitch: 0,
						bearing: 0
					});

					// Add navigation controls
					map.addControl(new mapboxgl.NavigationControl(), 'top-right');

					// ========== DIRECTIONS PLUGIN ==========
					directions = new MapboxDirections({
						accessToken: mapboxgl.accessToken,
						unit: 'metric',
						profile: 'mapbox/driving',
						controls: {
							inputs: false,
							instructions: true
						},
						placeholderOrigin: 'Your Location',
						placeholderDestination: 'Destination',
						geocoder: {
							language: 'en'
						}
					});

					map.addControl(directions, 'top-left');

					// Handle route changes
					directions.on('route', function(event) {
						if (event.route && event.route.length > 0) {
							initializeInstructionsToggle();
						}
					});

					// ========== MAP LOAD EVENT ==========
					map.on('load', function() {
						// Set destination
						directions.setDestination(destinationCoords);

						// Add destination marker
						new mapboxgl.Marker({color: '#0ff6be'})
							.setLngLat(destinationCoords)
							.addTo(map);

						// Request user location
						if (window.ReactNativeWebView) {
							window.ReactNativeWebView.postMessage(JSON.stringify({
								type: 'getLocation'
							}));
						}

						// Notify React Native that map is ready
						if (window.ReactNativeWebView) {
							window.ReactNativeWebView.postMessage(JSON.stringify({
								type: 'mapLoaded'
							}));
						}
					});

					// ========== USER LOCATION HANDLER ==========
					window.setUserLocation = function(lng, lat) {
						const userLocation = [lng, lat];
						if (directions) {
							directions.setOrigin(userLocation);
						}
					};

					// ========== DESTINATION NAME UPDATE ==========
					window.setDestinationName = function(name) {
						if (destNameElement) {
							destNameElement.textContent = name;
						}
					};
				</script>
			</body>
			</html>
		`;
	};

	const handleWebViewMessage = async (event: any) => {
		try {
			const data = JSON.parse(event.nativeEvent.data) as WebViewMessage;

			switch (data.type) {
				case "getLocation":
					try {
						const locationData = await ELocation.getCurrentPositionAsync({
							accuracy: ELocation.Accuracy.High,
						});
						const { latitude, longitude } = locationData.coords;

						if (webViewRef.current) {
							const jsCode = `
								window.setUserLocation(${longitude}, ${latitude});
								true;
							`;
							webViewRef.current.injectJavaScript(jsCode);
						}
					} catch (error) {
						console.error("Error getting location:", error);
					}
					break;

				case "mapLoaded":
					console.log("Map loaded and ready");
					setIsLoading(false);
					break;

				default:
					console.warn("Unknown message type:", data.type);
			}
		} catch (error) {
			console.error("Error handling WebView message:", error);
		}
	};

	return (
		<Modal visible={visible} animationType="slide">
			<SafeAreaView style={{ flex: 1, backgroundColor: "#161719" }}>
				<View
					style={{
						flexDirection: "row",
						justifyContent: "space-between",
						alignItems: "center",
						padding: 16,
						borderBottomWidth: 1,
						borderBottomColor: "#333333",
					}}
				>
					<Text
						style={{
							fontSize: 18,
							fontWeight: "700",
							color: "#f7f7f7",
						}}
					>
						{location.name}
					</Text>
					<TouchableOpacity onPress={onClose}>
						<Feather name="x" size={24} color="#f7f7f7" />
					</TouchableOpacity>
				</View>
				<WebView
					ref={webViewRef}
					source={{ html: getMapHTML() }}
					onMessage={handleWebViewMessage}
					javaScriptEnabled={true}
					domStorageEnabled={true}
					geolocationEnabled={true}
					startInLoadingState={true}
					style={{ flex: 1 }}
					renderLoading={() => (
						<View
							style={{
								flex: 1,
								justifyContent: "center",
								alignItems: "center",
								backgroundColor: "#161719",
							}}
						>
							<ActivityIndicator size="large" color="#0ff6be" />
						</View>
					)}
				/>
			</SafeAreaView>
		</Modal>
	);
};
