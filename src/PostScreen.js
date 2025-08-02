import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function PostScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [type, setType] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  useEffect(() => {
    if (route.params?.selectedLocation) {
      const { latitude, longitude } = route.params.selectedLocation;
      setLatitude(String(latitude));
      setLongitude(String(longitude));
    }
  }, [route.params?.selectedLocation]);

  const handleSubmit = async () => {
    try {
      const post = {
        title,
        content,
        date,
        type,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'posts'), post);
      console.log('保存完了！', post);
    } catch (e) {
      console.error('保存エラー:', e);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>タイトル</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="例：朝ジョグ＠代々木"
      />

      <Text style={styles.label}>内容</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={content}
        onChangeText={setContent}
        placeholder="ジョグペースで60分予定です"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>練習タイプ</Text>
      <TextInput
        style={styles.input}
        value={type}
        onChangeText={setType}
        placeholder="例：ジョグ"
      />

      <Button
        title="地図から場所を選ぶ"
        onPress={() => navigation.navigate('Map', { mode: 'select' })}
      />
      <Text>選んだ緯度: {latitude}</Text>
      <Text>選んだ経度: {longitude}</Text>

      {/* <Text style={styles.label}>日時</Text>
      <Button title={date.toLocaleString()} onPress={() => setShowPicker(true)} />
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display="default"
          onChange={handleDateChange}
        />
      )} */}

      <Button title="投稿する" onPress={handleSubmit} 
/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
  },
});
