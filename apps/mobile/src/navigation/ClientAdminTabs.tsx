import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Text } from 'react-native'
import InboxScreen from '../screens/inbox/InboxScreen'
import ConversationDetailScreen from '../screens/inbox/ConversationDetailScreen'
import EscalationsScreen from '../screens/escalations/EscalationsScreen'
import LeadsScreen from '../screens/leads/LeadsScreen'
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen'
import AgentConfigScreen from '../screens/agent/AgentConfigScreen'
import SettingsScreen from '../screens/settings/SettingsScreen'

const Tab = createBottomTabNavigator()
const InboxStack = createNativeStackNavigator()
const SettingsStack = createNativeStackNavigator()
const EscalationStack = createNativeStackNavigator()

function InboxStackScreen() {
  return (
    <InboxStack.Navigator>
      <InboxStack.Screen name="InboxList" component={InboxScreen} options={{ title: 'Inbox', headerLargeTitle: true }} />
      <InboxStack.Screen name="ConversationDetail" component={ConversationDetailScreen} options={{ title: 'Conversation' }} />
    </InboxStack.Navigator>
  )
}

function EscalationsStackScreen() {
  return (
    <EscalationStack.Navigator>
      <EscalationStack.Screen name="EscalationsList" component={EscalationsScreen} options={{ title: 'Escalations' }} />
      <EscalationStack.Screen name="ConversationDetail" component={ConversationDetailScreen} options={{ title: 'Conversation' }} />
    </EscalationStack.Navigator>
  )
}

function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} options={{ title: 'Settings' }} />
      <SettingsStack.Screen name="AgentConfig" component={AgentConfigScreen} options={{ title: 'Agent Config' }} />
    </SettingsStack.Navigator>
  )
}

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => (
  <Text style={{ fontSize: 12, color: focused ? '#2563eb' : '#94a3b8' }}>{label}</Text>
)

export default function ClientAdminTabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#2563eb', tabBarInactiveTintColor: '#94a3b8', headerShown: false }}>
      <Tab.Screen name="Inbox" component={InboxStackScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon label="💬" focused={focused} /> }} />
      <Tab.Screen name="Escalations" component={EscalationsStackScreen} options={{ headerShown: false, tabBarIcon: ({ focused }) => <TabIcon label="🚨" focused={focused} /> }} />
      <Tab.Screen name="Leads" component={LeadsScreen} options={{ headerShown: true, title: 'Leads', tabBarIcon: ({ focused }) => <TabIcon label="📋" focused={focused} /> }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ headerShown: true, title: 'Analytics', tabBarIcon: ({ focused }) => <TabIcon label="📊" focused={focused} /> }} />
      <Tab.Screen name="Settings" component={SettingsStackScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon label="⚙️" focused={focused} /> }} />
    </Tab.Navigator>
  )
}
