import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export default function MapScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [region, setRegion] = useState(null);
  const [marker, setMarker] = useState(null);
  const [posts, setPosts] = useState([]);

  const isSelectMode = route.params?.mode === 'select';

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('位置情報の許可が必要です');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const center = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(center);
    })();
  }, []);

  // 投稿一覧を取得（表示モードのときのみ）
  useEffect(() => {
    if (!isSelectMode) {
      (async () => {
        const snap = await getDocs(collection(db, 'posts'));
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPosts(data);
      })();
    }
  }, [isSelectMode]);

  const handleMapPress = (event) => {
    const coordinate = event.nativeEvent.coordinate;
    if (isSelectMode) {
      setMarker(coordinate);
      navigation.navigate('Post', { selectedLocation: coordinate });
    }
  };

  if (!region) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onPress={handleMapPress}
      >
        {/* モードによってマーカー切り替え */}
        {isSelectMode && marker && <Marker coordinate={marker} />}

        {!isSelectMode &&
          posts.map((post) => (
            <Marker
              key={post.id}
              coordinate={{
                latitude: post.latitude,
                longitude: post.longitude,
              }}
              title={post.title}
              description={post.type}
            />
          ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
