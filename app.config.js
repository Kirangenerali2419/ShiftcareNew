export default {
  expo: {
    name: 'ShiftCare Appointments',
    slug: 'shiftcare-appointments',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    "newArchEnabled": false,
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.anonymous.shiftcareappointments"
    },
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            newArchEnabled: false
          },
          ios: {
            newArchEnabled: false
          }
        }
      ]
    ]
  }
};