import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useFitTrack } from '../../context/FitTrackContext';
import { QUICK_CHAT_PROMPTS } from '../../constants/fitnessData';
import { styles } from '../../styles/theme';

export default function ChatTab() {
  const { answers, messages, loadingChat, backendStatus, sendChat, clearChat } = useFitTrack();
  const [chatInput, setChatInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 60);
    return () => clearTimeout(timer);
  }, [messages.length, loadingChat]);

  const handleSend = (overrideText) => {
    const text = overrideText ?? chatInput;
    if (!text.trim() || loadingChat) return;
    if (!overrideText) setChatInput('');
    sendChat(text);
  };

  return (
    <View style={styles.card}>
      <View style={[styles.rowBetween, { marginBottom: 8 }]}>
        <Text style={[styles.cardTitle, { marginBottom: 0 }]}>LevelUp AI Coach</Text>
        <View style={styles.row}>
          <Text
            style={[
              styles.pill,
              backendStatus.online ? styles.pillGreen : styles.pillBlue
            ]}
          >
            {backendStatus.online ? 'Server Connected' : 'Local AI Mode'}
          </Text>
          <TouchableOpacity onPress={clearChat}>
            <Text style={[styles.muted, { fontWeight: '600' }]}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.muted, { marginBottom: 4 }]}>
        LevelUp AI uses your exact profile ({answers.age}y {answers.gender}, {answers.weightKg}kg ➔{' '}
        {answers.targetWeightKg}kg, {answers.equipment}):
      </Text>
      <Text style={[styles.muted, { marginBottom: 8, color: '#60A5FA', fontWeight: '600' }]}>
        Scope: Workouts, Diet, Calories, Recovery & LevelUp Progress only
      </Text>

      <View style={[styles.chipWrap, { marginBottom: 10 }]}>
        {QUICK_CHAT_PROMPTS.map((q) => (
          <TouchableOpacity key={q} style={styles.chip} onPress={() => handleSend(q)}>
            <Text style={styles.chipText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chatBox}
        nestedScrollEnabled
        contentContainerStyle={{ paddingBottom: 6 }}
      >
        {messages.map((m, i) => (
          <View key={i} style={[styles.msg, m.sender === 'user' ? styles.msgUser : styles.msgBot]}>
            <Text style={{ color: '#F8FAFC', fontSize: 13, lineHeight: 19 }}>
              {m.text}
            </Text>
          </View>
        ))}
        {loadingChat ? <Text style={styles.muted}>LevelUp AI is thinking...</Text> : null}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={chatInput}
          onChangeText={setChatInput}
          placeholder="Ask about workouts, diet, calories..."
          placeholderTextColor="#a1a1aa"
          maxLength={500}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.btn} onPress={() => handleSend()} disabled={loadingChat}>
          <Text style={styles.btnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
