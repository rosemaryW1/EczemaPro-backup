import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Share } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import TaskBar from '../components/TaskBar';
import UpperTaskBar from '../components/UpperTaskBar';
import CustomButton from '../components/CustomButton';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { FontAwesome5 } from '@expo/vector-icons';

const Results = ({ route, navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { imageUrl, result, confidence } = route.params || {};

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

  async function shareToWhatsApp() {
    try {
      const message = `Check out my skin analysis results from Eczema Pro! ${result} (${confidence}% confidence)`;
      await Share.share({
        message,
        url: imageUrl, // iOS only
      });
    } catch (error) {
      alert('Error sharing to WhatsApp');
    }
    setModalVisible(false);
  }

  async function shareViaEmail() {
    try {
      const message = `Here are my skin analysis results from Eczema Pro: ${result} (${confidence}% confidence).`;
      await Share.share({
        message,
        url: imageUrl, // iOS only
      });
    } catch (error) {
      alert('Error sharing via email');
    }
    setModalVisible(false);
  }

  async function downloadResults() {
    try {
      if (imageUrl) {
        const uri = FileSystem.documentDirectory + 'eczema-result.jpg';
        const downloadedFile = await FileSystem.downloadAsync(imageUrl, uri);
        alert('Results downloaded successfully to ' + downloadedFile.uri);
      } else {
        alert('No results to download.');
      }
    } catch (error) {
      alert('Error downloading results');
    }
    setModalVisible(false);
  }

  return (
    <View style={styles.container}>
      <UpperTaskBar />

      <View style={styles.content}>
        <Text style={styles.title}>Analysis Results</Text>

        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.analyzedImage}
          />
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
