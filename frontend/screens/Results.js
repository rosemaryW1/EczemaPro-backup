import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Share, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import TaskBar from '../components/TaskBar';
import UpperTaskBar from '../components/UpperTaskBar';
import CustomButton from '../components/CustomButton';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';

const Results = ({ route, navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { imageUrl, result, confidence, capturedImageUri } = route.params || {};

  // Generate message with image URL
  const generateMessage = () => {
    return `
Eczema Pro Analysis Results:
Prediction: ${result}
Confidence: ${confidence}%
Image: ${imageUrl || capturedImageUri}
    `.trim();
  };

  // Sharing to WhatsApp
  async function shareToWhatsApp() {
    try {
      const message = generateMessage();
      const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        await Share.share({ message });
      }
      Toast.show({
        type: 'success',
        text1: 'Results Shared',
        text2: 'Your results have been shared to WhatsApp.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to share results to WhatsApp.',
      });
    }
    setModalVisible(false);
  }

  // Sharing via Email
  async function shareViaEmail() {
    try {
      const message = generateMessage();
      const mailto = `mailto:?subject=Eczema Analysis Results&body=${encodeURIComponent(message)}`;
      if (Platform.OS === 'web') {
        window.open(mailto, '_blank');
      } else {
        await Share.share({ message });
      }
      Toast.show({
        type: 'success',
        text1: 'Results Shared',
        text2: 'Your results have been shared via Email.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to share results via Email.',
      });
    }
    setModalVisible(false);
  }

  // Download Results
  async function downloadResults() {
    try {
      if (Platform.OS === 'web') {
        if (imageUrl || capturedImageUri) {
          const response = await fetch(imageUrl || capturedImageUri);
          const blob = await response.blob();
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'eczema-result.jpg';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          Toast.show({
            type: 'success',
            text1: 'Download Complete',
            text2: 'Results downloaded successfully.',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Download Failed',
            text2: 'No results to download.',
          });
        }
      } else {
        if (imageUrl || capturedImageUri) {
          const fileUri = FileSystem.documentDirectory + 'eczema-result.jpg';
          await FileSystem.downloadAsync(imageUrl || capturedImageUri, fileUri);
          Alert.alert('Download Complete', `Image downloaded to: ${fileUri}`);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Download Failed',
            text2: 'No results to download.',
          });
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to download results.',
      });
    }
    setModalVisible(false);
  }

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: {
        library: FontAwesome5,
        name: 'whatsapp',
        size: 24,
        color: '#25D366',
      },
      action: shareToWhatsApp,
    },
    {
      name: 'Email',
      icon: {
        library: FontAwesome5,
        name: 'envelope',
        size: 24,
        color: '#DB4437',
      },
      action: shareViaEmail,
    },
    {
      name: 'Download',
      icon: {
        library: FontAwesome5,
        name: 'download',
        size: 24,
        color: '#4285F4',
      },
      action: downloadResults,
    },
  ];

  return (
    <View style={styles.container}>
      <UpperTaskBar />
      <View style={styles.content}>
        <Text style={styles.title}>Analysis Results</Text>

        {capturedImageUri && (
          <Image source={{ uri: capturedImageUri }} style={styles.analyzedImage} />
        )}

        <View style={styles.resultBox}>
          <Text style={styles.resultText}>
            {result
              ? `${result} (${confidence}% confidence)`
              : 'Results not available.'}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            title="New Analysis"
            onPress={() => navigation.navigate('Capture')}
          />
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => setModalVisible(true)}
          >
            <MaterialIcons name="share" size={24} color="#fff" />
            <Text style={styles.shareButtonText}>Share Results</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Results</Text>

            {shareOptions.map((option, index) => {
              const IconComponent = option.icon.library;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.shareOption}
                  onPress={option.action}
                >
                  <IconComponent
                    name={option.icon.name}
                    size={option.icon.size}
                    color={option.icon.color}
                  />
                  <Text style={styles.shareOptionText}>{option.name}</Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TaskBar />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  analyzedImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  resultBox: {
    width: '90%',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  shareButton: {
    backgroundColor: '#84a59d',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 25,
    gap: 5,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  shareOptionText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#f28482',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Results;
