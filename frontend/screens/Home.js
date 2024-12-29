import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import CustomButton from '../components/CustomButton';
import TaskBar from '../components/TaskBar';
import UpperTaskBar from '../components/UpperTaskBar';
import { useNavigation } from '@react-navigation/native';

// Get device dimensions
const { width, height } = Dimensions.get('window');

const Home = () => {
  const navigation = useNavigation();

  // Handler for the capture button
  const handleCapture = () => {
    navigation.navigate('Capture');
  };

  return (
    // Use ImageBackground to set a background image
    <ImageBackground
      source={require('../assets/background.png')} 
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Eczema Pro!</Text>
        <Text style={styles.heading}>Get your skin analyzed for eczema using our powerful AI model</Text>
        <CustomButton title="Get skin analysis" onPress={handleCapture} />
        <TaskBar />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    width: width,  
    height: height,  
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adds a transparent overlay
  },
  title: {
    fontSize: 31,
    fontWeight: '900',
    color: '#FF1493',
    textAlign: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    color: '#FF1493',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default Home;