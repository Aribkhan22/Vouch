import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { AdminTabParamList, AdminStackParamList } from './types';
import { COLORS } from '@utils/constants';

import AdminDashboardScreen from '@features/admin/screens/AdminDashboardScreen';
import AdminProfessionalsScreen from '@features/admin/screens/AdminProfessionalsScreen';
import AdminProfileScreen from '@features/admin/screens/AdminProfileScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator<AdminStackParamList>();

const TAB_ICONS: Record<string, string> = {
  Verifications: '📋',
  Professionals: '👥',
  AdminProfile: '👤',
};

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ focused }) => (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>
              {TAB_ICONS[route.name]}
            </Text>
          </View>
        ),
        tabBarLabel: ({ color }) => {
          const labels: Record<string, string> = {
            Verifications: 'Verifications',
            Professionals: 'Lawyers/CAs',
            AdminProfile: 'Profile',
          };
          return (
            <Text style={{ color, fontSize: 11, marginBottom: 2 }}>
              {labels[route.name]}
            </Text>
          );
        },
      })}>
      <Tab.Screen name="Verifications" component={AdminDashboardScreen} />
      <Tab.Screen name="Professionals" component={AdminProfessionalsScreen} />
      <Tab.Screen name="AdminProfile" component={AdminProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
    </Stack.Navigator>
  );
}
