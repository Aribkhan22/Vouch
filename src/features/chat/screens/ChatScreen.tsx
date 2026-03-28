import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import SafeScreen from '@components/common/SafeScreen';
import AppLoader from '@components/common/AppLoader';
import ErrorMessage from '@components/common/ErrorMessage';
import { useSocket } from '@hooks/useSocket';
import { useAppSelector } from '@store/hooks';
import { chatApi } from '@api/chat.api';
import { COLORS, SPACING } from '@utils/constants';
import { Message } from '@types/index';

export default function ChatScreen({ route }: any) {
  const { chatId } = route.params as { chatId: string; requestId: string };
  const user = useAppSelector(s => s.auth.user);
  const [text, setText] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const flatRef = useRef<FlatList>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => chatApi.getMessages(chatId, 1, 50),
    onSuccess: (res: any) => setLocalMessages(res.data ?? []),
  } as any);

  const onNewMessage = useCallback((msg: Message) => {
    setLocalMessages(prev => [...prev, msg]);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const { sendMessage } = useSocket(chatId, onNewMessage);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText('');
  };

  if (isLoading) return <AppLoader message="Loading chat..." />;

  return (
    <SafeScreen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        {error ? <ErrorMessage message="Failed to load messages" /> : null}
        <FlatList
          ref={flatRef}
          data={localMessages}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const isOwn = item.sender._id === user?._id || item.sender === user?._id;
            return (
              <View style={[styles.bubble, isOwn ? styles.own : styles.other]}>
                {!isOwn && <Text style={styles.senderName}>{item.sender?.name ?? 'Other'}</Text>}
                <Text style={[styles.msgText, isOwn && styles.ownText]}>{item.content}</Text>
                <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            );
          }}
        />
        <View style={styles.inputRow}>
          <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Type a message..." placeholderTextColor={COLORS.placeholder} multiline />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: SPACING.md, flexGrow: 1, justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', borderRadius: 12, padding: SPACING.sm, marginBottom: SPACING.xs },
  own: { alignSelf: 'flex-end', backgroundColor: COLORS.primary },
  other: { alignSelf: 'flex-start', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  senderName: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 2 },
  msgText: { fontSize: 14, color: COLORS.textPrimary },
  ownText: { color: '#fff' },
  time: { fontSize: 10, color: COLORS.placeholder, marginTop: 4, alignSelf: 'flex-end' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.background },
  input: { flex: 1, minHeight: 40, maxHeight: 100, borderRadius: 20, backgroundColor: COLORS.surface, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, fontSize: 14, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, marginRight: SPACING.sm },
  sendBtn: { backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  sendText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
