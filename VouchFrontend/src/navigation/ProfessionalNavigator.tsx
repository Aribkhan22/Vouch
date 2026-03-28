import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { ProfessionalTabParamList, ProfessionalStackParamList } from './types';
import { COLORS } from '@utils/constants';

// Screens
import OpenRequestsScreen from '@features/professional/screens/OpenRequestsScreen';
import AcceptedRequestsScreen from '@features/professional/screens/AcceptedRequestsScreen';
import ProfessionalProfileScreen from '@features/professional/screens/ProfessionalProfileScreen';
import VerificationUploadScreen from '@features/professional/screens/VerificationUploadScreen';
import ChatScreen from '@features/chat/screens/ChatScreen';

const Tab = createBottomTabNavigator<ProfessionalTabParamList>();
const Stack = createNativeStackNavigator<ProfessionalStackParamList>();

function ProfessionalTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabel: ({ color }) => {
          const labels: Record<string, string> = {
            OpenRequests: 'Open Jobs',
            MyAccepted: 'My Jobs',
            Profile: 'Profile',
          };
          return <Text style={{ color, fontSize: 11 }}>{labels[route.name]}</Text>;
        },
      })}>
      <Tab.Screen name="OpenRequests" component={OpenRequestsScreen} />
      <Tab.Screen name="MyAccepted" component={AcceptedRequestsScreen} />
      <Tab.Screen name="Profile" component={ProfessionalProfileScreen} />
    </Tab.Navigator>
  );
}

export default function ProfessionalNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfessionalTabs" component={ProfessionalTabs} />
      <Stack.Screen name="VerificationUpload" component={VerificationUploadScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
