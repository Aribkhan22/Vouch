import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { StartupTabParamList, StartupStackParamList } from './types';
import { COLORS } from '@utils/constants';

// Screens
import DirectoryScreen from '@features/startup/screens/DirectoryScreen';
import MyRequestsScreen from '@features/startup/screens/MyRequestsScreen';
import StartupProfileScreen from '@features/startup/screens/StartupProfileScreen';
import ProfessionalDetailScreen from '@features/startup/screens/ProfessionalDetailScreen';
import CreateRequestScreen from '@features/startup/screens/CreateRequestScreen';
import ChatScreen from '@features/chat/screens/ChatScreen';

const Tab = createBottomTabNavigator<StartupTabParamList>();
const Stack = createNativeStackNavigator<StartupStackParamList>();

function StartupTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabel: ({ color }) => {
          const labels: Record<string, string> = {
            Directory: 'Find Pro',
            MyRequests: 'Requests',
            Profile: 'Profile',
          };
          return <Text style={{ color, fontSize: 11 }}>{labels[route.name]}</Text>;
        },
      })}>
      <Tab.Screen name="Directory" component={DirectoryScreen} />
      <Tab.Screen name="MyRequests" component={MyRequestsScreen} />
      <Tab.Screen name="Profile" component={StartupProfileScreen} />
    </Tab.Navigator>
  );
}

export default function StartupNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StartupTabs" component={StartupTabs} />
      <Stack.Screen name="ProfessionalDetail" component={ProfessionalDetailScreen} />
      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
