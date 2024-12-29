import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import TaskBar from '../components/TaskBar';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const Capture = () => {
  const [imageUri, setImageUri] = useState(null); // Local image URI
  const [uploadedUrl, setUploadedUrl] = useState(null); // S3 image URL
  const [uploading, setUploading] = useState(false); // Track upload state
  const navigation = useNavigation();
  const fileInputRef = useRef(null); // Ref for the file input element

  // Function to open the camera or file picker
  const openCameraOrPicker = async () => {
    if (Platform.OS === 'web') {
      fileInputRef.current.click(); // Trigger the file input click event on the web
    } else {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status === 'granted') {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });

        if (!result.canceled) {
          setImageUri(result.assets[0].uri);
          setUploadedUrl(null); // Reset the uploaded URL for a new image
        }
      } else {
        Alert.alert('Permission Denied', 'Camera access is required to take photos.');
      }
    }
  };

  // Handle file selection for the web
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file); // Create a local URL for preview
      setImageUri(fileURL);
      setUploadedUrl(null); // Reset the uploaded URL for a new image
    }
  };

  // Function to upload the image to the backend
  const uploadImage = async () => {
    if (!imageUri && Platform.OS !== 'web') {
      Alert.alert('No Image', 'Please capture an image before uploading.');
      return;
    }

    if (Platform.OS === 'web') {
      const fileInput = fileInputRef.current;
      if (!fileInput?.files?.[0]) {
        Alert.alert('No Image', 'Please select an image before uploading.');
        return;
      }
    }

    setUploading(true); // Set uploading state to true

    try {
      const formData = new FormData();

      if (Platform.OS === 'web') {
        const file = fileInputRef.current.files[0];
        formData.append('file', file);
      } else {
        formData.append('file', {
          uri: imageUri,
          name: 'image.jpg',
          type: 'image/jpeg',
        });
      }

      const response = await axios.post('https://de3f-41-90-172-108.ngrok-free.app/upload-image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const { url, prediction } = response.data || {};
      setUploadedUrl(url); // Save the uploaded URL

      const confidence = prediction?.[0]?.[0] ?? 0;
      const result = confidence > 0.5 ? 'Eczema Detected' : 'No Eczema Detected';

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Image uploaded and analyzed successfully!',
      });

      navigation.navigate('Results', { imageUrl: url, result, confidence: (confidence * 100).toFixed(2) });
    } catch (error) {
      console.error('Upload failed:', error);

      Toast.show({
        type: 'error',
        text1: 'Upload Error',
        text2: 'Unable to upload the image. Please try again.',
      });
    } finally {
      setUploading(false); // Reset uploading state
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && (
        <input
          type="file"
          id="file-input"
          accept="image/jpeg, image/png"
          style={{ display: 'none' }} // Hide the file input
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      )}

      <TouchableOpacity style={styles.circle} onPress={openCameraOrPicker}>
        <MaterialIcons name="photo-camera" size={80} color="#ffffff" />
      </TouchableOpacity>

      <Text style={styles.title}>Click the camera icon to capture or select an image 😊</Text>

      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.capturedImage}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.uploadButton, (!imageUri && Platform.OS !== 'web') && styles.disabledButton]}
          onPress={uploadImage}
          disabled={!imageUri && Platform.OS !== 'web' || uploading}
        >
          <Text style={styles.buttonText}>{uploading ? 'Uploading...' : 'Analyze Photo'}</Text>
        </TouchableOpacity>
      </View>

      <TaskBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#f28482',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  capturedImage: {
    width: 250,
    height: 250,
    marginTop: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 50,
    width: '90%',
  },
  uploadButton: {
    backgroundColor: '#f28482',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default Capture;
