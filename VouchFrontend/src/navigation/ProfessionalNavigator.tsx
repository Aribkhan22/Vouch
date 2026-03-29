import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ProfessionalTabParamList, ProfessionalStackParamList } from './types';
import { COLORS } from '@utils/constants';
import { requestApi } from '@api/request.api';
import { ServiceRequest } from '@types/index';
import { useAppSelector } from '@store/hooks';

// Screens
import OpenRequestsScreen from '@features/professional/screens/OpenRequestsScreen';
import AcceptedRequestsScreen from '@features/professional/screens/AcceptedRequestsScreen';
import LawyerProfileScreen from '@features/professional/screens/LawyerProfileScreen';
import CAProfileScreen from '@features/professional/screens/CAProfileScreen';
import VerificationUploadScreen from '@features/professional/screens/VerificationUploadScreen';
import ChatScreen from '@features/chat/screens/ChatScreen';

const Tab = createBottomTabNavigator<ProfessionalTabParamList>();
const Stack = createNativeStackNavigator<ProfessionalStackParamList>();

// Stable wrapper — React Navigation always sees the same component reference
function ProfileTabScreen(props: any) {
  const role = useAppSelector(s => s.auth.user?.role);
  return role === 'CA' ? <CAProfileScreen {...props} /> : <LawyerProfileScreen {...props} />;
}

const TAB_ICONS: Record<string, string> = {
  OpenRequests: '💼',
  MyAccepted: '✅',
  Profile: '👤',
};

function ProfessionalTabs() {
  // Badge: open jobs available to this professional
  const { data: openData } = useQuery({
    queryKey: ['openRequests'],
    queryFn: () => requestApi.open().then(r => r.data.data),
    refetchInterval: 30_000,
  });
  const totalOpen = ((openData as any)?.results?.length as number) ?? 0;

  // Badge: newly accepted jobs waiting for chat
  const { data: myJobs } = useQuery({
    queryKey: ['myJobs'],
    queryFn: () => requestApi.mine().then(r => r.data.data as ServiceRequest[]),
    refetchInterval: 30_000,
  });
  const totalAccepted = (myJobs ?? []).filter(r => r.status === 'ACCEPTED').length;

  const [seenOpen, setSeenOpen] = useState(0);
  const [seenAccepted, setSeenAccepted] = useState(0);
  const openBadge = Math.max(0, totalOpen - seenOpen) || undefined;
  const acceptedBadge = Math.max(0, totalAccepted - seenAccepted) || undefined;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarBadgeStyle: { backgroundColor: COLORS.error, fontSize: 10, minWidth: 16, height: 16 },
        tabBarIcon: ({ focused }) => (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>
              {TAB_ICONS[route.name]}
            </Text>
          </View>
        ),
        tabBarLabel: ({ color }) => {
          const labels: Record<string, string> = {
            OpenRequests: 'Open Jobs',
            MyAccepted: 'My Jobs',
            Profile: 'Profile',
          };
          return <Text style={{ color, fontSize: 11, marginBottom: 2 }}>{labels[route.name]}</Text>;
        },
      })}>
      <Tab.Screen
        name="OpenRequests"
        component={OpenRequestsScreen}
        options={{ tabBarBadge: openBadge }}
        listeners={{ focus: () => setSeenOpen(totalOpen) }}
      />
      <Tab.Screen
        name="MyAccepted"
        component={AcceptedRequestsScreen}
        options={{ tabBarBadge: acceptedBadge }}
        listeners={{ focus: () => setSeenAccepted(totalAccepted) }}
      />
      <Tab.Screen name="Profile" component={ProfileTabScreen} />
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
