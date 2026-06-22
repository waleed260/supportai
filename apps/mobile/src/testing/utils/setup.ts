import '@testing-library/jest-native/extend-jest'

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}))

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
  getExpoPushTokenAsync: jest.fn(() => ({ data: 'mock-token' })),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  setNotificationChannelAsync: jest.fn(),
}))

jest.mock('expo-device', () => ({
  isDevice: true,
}))

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      supabaseUrl: 'https://mock.supabase.co',
      supabaseAnonKey: 'mock-key',
      eas: { projectId: 'mock-project' },
    },
    version: '1.0.0',
  },
}))

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)
