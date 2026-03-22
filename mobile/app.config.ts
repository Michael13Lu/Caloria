import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Caloria',
  slug: 'caloria',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0F0F1A',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.caloria.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0F0F1A',
    },
    package: 'com.caloria.app',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#4F46E5',
      },
    ],
  ],
  scheme: 'caloria',
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    eas: {
      projectId: 'YOUR_EAS_PROJECT_ID',
    },
  },
});
