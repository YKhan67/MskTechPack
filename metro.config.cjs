const { getDefaultConfig } = require("expo/metro-config");

// NativeWind v4 and v5 use 'nativewind/metro' or 'nativewind/utils' depending on configuration.
// If 'nativewind/utils' failed, 'nativewind/metro' is the required compiler import.
const { withNativeWind } = require("nativewind/metro"); 

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
