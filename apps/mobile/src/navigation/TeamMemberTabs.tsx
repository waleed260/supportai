import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Text } from 'react-native'
import InboxScreen from '../screens/inbox/InboxScreen'
import ConversationDetailScreen from '../screens/inbox/ConversationDetailScreen'
import EscalationsScreen from '../screens/escalations/EscalationsScreen'
import SettingsScreen from '../screens/settings/SettingsScreen'

const Tab = createBottomTabNavigator()
const InboxStack = createNativeStackNavigator()
const EscalationStack = createNativeStackNavigator()
const SettingsStack = createNativeStackNavigator()

function InboxStackScreen() {
  return (
    <InboxStack.Navigator>
      <InboxStack.Screen name="InboxList" component={InboxScreen} options={{ title: 'Inbox' }} />
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
    </SettingsStack.Navigator>
  )
}

const TabIcon = ({ label }: { label: string }) => <Text style={{ fontSize: 12 }}>{label}</Text>

export default function TeamMemberTabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#2563eb', tabBarInactiveTintColor: '#94a3b8', headerShown: false }}>
      <Tab.Screen name="Inbox" component={InboxStackScreen} options={{ tabBarIcon: () => <TabIcon label="💬" /> }} />
      <Tab.Screen name="Escalations" component={EscalationsStackScreen} options={{ headerShown: false, tabBarIcon: () => <TabIcon label="🚨" /> }} />
      <Tab.Screen name="Settings" component={SettingsStackScreen} options={{ tabBarIcon: () => <TabIcon label="⚙️" /> }} />
    </Tab.Navigator>
  )
}
