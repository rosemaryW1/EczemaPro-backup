import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const CustomSplash = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/splashGIF.gif')}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  image: {
    width: width,
    height: height,
  },
});

export default CustomSplash;