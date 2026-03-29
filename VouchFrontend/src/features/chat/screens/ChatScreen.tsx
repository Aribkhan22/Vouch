import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SafeScreen from '@components/common/SafeScreen';
import AppLoader from '@components/common/AppLoader';
import { useSocket } from '@hooks/useSocket';
import { useAppSelector } from '@store/hooks';
import { chatApi } from '@api/chat.api';
import { COLORS, SPACING, BORDER_RADIUS } from '@utils/constants';
import { Message, ChatWithParticipants } from '@types/index';

export default function ChatScreen({ route }: any) {
  const { chatId, requestId } = route.params as { chatId: string; requestId: string };
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const user = useAppSelector(s => s.auth.user);
  const [inputText, setInputText] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const flatRef = useRef<FlatList>(null);

  // Fetch enriched chat info (participant names + types)
  const { data: chatInfo } = useQuery({
    queryKey: ['chatInfo', chatId],
    queryFn: () => chatApi.getChat(chatId).then(r => r.data.data as ChatWithParticipants),
  });

  // Fetch message history
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => chatApi.getMessages(chatId, 1, 50),
  });

  // TanStack Query v5: no onSuccess — sync via useEffect
  useEffect(() => {
    const msgs: Message[] = (messagesData as any)?.data?.data?.messages ?? [];
    if (msgs.length > 0) {
      setLocalMessages(msgs);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [messagesData]);

  const onNewMessage = useCallback((msg: Message) => {
    setLocalMessages(prev => [...prev, msg]);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const { sendMessage } = useSocket(chatId, onNewMessage);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInputText('');
  };

  // Resolve display name and subtitle for a given senderId
  const getSenderInfo = (senderId: string): { name: string; sub: string } => {
    if (!chatInfo) return { name: '', sub: '' };
    if (senderId === chatInfo.startupUserId) {
      return { name: chatInfo.startupName, sub: 'Startup' };
    }
    if (senderId === chatInfo.professionalUserId) {
      return { name: chatInfo.professionalName, sub: chatInfo.professionalType };
    }
    return { name: 'Unknown', sub: '' };
  };

  // Determine the "other" person's name for the header
  const otherName = (() => {
    if (!chatInfo || !user) return 'Chat';
    if (user.role === 'STARTUP') {
      return `${chatInfo.professionalName} · ${chatInfo.professionalType}`;
    }
    return chatInfo.startupName;
  })();

  if (isLoading) return <AppLoader message="Loading chat..." />;

  return (
    // paddingBottom: 0 so KAV takes full ownership of the bottom edge
    <SafeScreen style={{ paddingBottom: 0 }}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.topTitle} numberOfLines={1}>{otherName}</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList
          ref={flatRef}
          data={localMessages}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const isOwn =
              item.senderId === user?.id ||
              item.senderId?.toString() === user?.id?.toString();
            const { name, sub } = isOwn ? { name: '', sub: '' } : getSenderInfo(item.senderId);
            return (
              <View style={[styles.bubbleWrapper, isOwn ? styles.ownWrapper : styles.otherWrapper]}>
                {!isOwn && (name || sub) ? (
                  <Text style={styles.senderLabel}>
                    {name}{sub ? `  ·  ${sub}` : ''}
                  </Text>
                ) : null}
                <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
                  <Text style={[styles.msgText, isOwn && styles.ownText]}>{item.text}</Text>
                  <Text style={[styles.time, isOwn && styles.ownTime]}>
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>No messages yet. Say hello! 👋</Text>
            </View>
          }
        />

        {/* Input row — bottom inset here, not on SafeScreen */}
        <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, SPACING.sm) }]}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}>
            <Text style={styles.sendText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 70 },
  backText: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  list: { padding: SPACING.md, paddingBottom: SPACING.sm, flexGrow: 1, justifyContent: 'flex-end' },
  bubbleWrapper: { marginBottom: SPACING.sm },
  ownWrapper: { alignItems: 'flex-end' },
  otherWrapper: { alignItems: 'flex-start' },
  senderLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 3,
    marginHorizontal: 4,
    fontWeight: '600',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  ownBubble: { backgroundColor: COLORS.primary },
  otherBubble: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  msgText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  ownText: { color: '#fff' },
  time: { fontSize: 10, color: COLORS.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  ownTime: { color: 'rgba(255,255,255,0.7)' },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyChatText: { fontSize: 14, color: COLORS.textMuted },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.border },
  sendText: { color: '#fff', fontWeight: '900', fontSize: 18 },
});
