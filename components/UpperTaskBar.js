import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UpperTaskBar = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eczema Pro</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f28482',
  },
});

export default UpperTaskBar;