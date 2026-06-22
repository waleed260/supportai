import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text } from 'react-native'
import ClientsScreen from '../screens/super-admin/ClientsScreen'
import PlatformAnalyticsScreen from '../screens/super-admin/PlatformAnalyticsScreen'
import SettingsScreen from '../screens/settings/SettingsScreen'

const Tab = createBottomTabNavigator()
const TabIcon = ({ label }: { label: string }) => <Text style={{ fontSize: 12 }}>{label}</Text>

export default function SuperAdminTabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#2563eb', tabBarInactiveTintColor: '#94a3b8' }}>
      <Tab.Screen name="Clients" component={ClientsScreen} options={{ title: 'Clients', tabBarIcon: () => <TabIcon label="🏢" /> }} />
      <Tab.Screen name="Analytics" component={PlatformAnalyticsScreen} options={{ title: 'Analytics', tabBarIcon: () => <TabIcon label="📊" /> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarIcon: () => <TabIcon label="⚙️" /> }} />
    </Tab.Navigator>
  )
}
