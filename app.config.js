export default {
  expo: {
    name: "ShiftCare Appointments",
    slug: "shiftcare-appointments",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    splash: {
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.shiftcare.appointments"
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      },
      package: "com.shiftcare.appointments",
      permissions: []
    },
    web: {}
  }
};
