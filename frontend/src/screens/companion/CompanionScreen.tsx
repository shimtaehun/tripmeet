import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CompanionScreen() {
  return (
    <View style={styles.container}>
      <Text>CompanionScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
