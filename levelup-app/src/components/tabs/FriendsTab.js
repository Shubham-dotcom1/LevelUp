import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useFitTrack } from '../../context/FitTrackContext';
import { styles } from '../../styles/theme';

export default function FriendsTab() {
  const { appData, addFriend, sendFriendSnap } = useFitTrack();
  const [friendName, setFriendName] = useState('');
  const [friendError, setFriendError] = useState('');

  const handleAddFriend = () => {
    const result = addFriend(friendName);
    if (!result.ok) {
      setFriendError(result.error);
      return;
    }
    setFriendError('');
    setFriendName('');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Friends & Workout Streaks</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={friendName}
          onChangeText={(val) => {
            setFriendName(val);
            if (friendError) setFriendError('');
          }}
          placeholder="Friend username (e.g. rohit_fit)"
          placeholderTextColor="#a1a1aa"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.btn} onPress={handleAddFriend}>
          <Text style={styles.btnText}>Add Friend</Text>
        </TouchableOpacity>
      </View>
      {friendError ? <Text style={styles.errorText}>{friendError}</Text> : null}

      <View style={{ marginTop: 12 }}>
        {appData.friends.length === 0 ? (
          <Text style={[styles.muted, { fontStyle: 'italic', marginVertical: 8 }]}>
            No friends added yet. Enter a username above to start a workout streak!
          </Text>
        ) : (
          appData.friends.map((f, i) => (
            <View key={`${f.name}-${i}`} style={styles.listRow}>
              <View>
                <Text style={styles.bold}>@{f.name}</Text>
                <Text style={styles.muted}>🔥 {f.streak} day streak</Text>
              </View>
              <TouchableOpacity
                disabled={f.snapped}
                onPress={() => sendFriendSnap(i)}
                style={[styles.btn, f.snapped && { opacity: 0.45 }]}
              >
                <Text style={styles.btnText}>{f.snapped ? 'Sent Today' : 'Send Snap'}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
