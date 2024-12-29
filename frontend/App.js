import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './screens/Home';
import Capture from './screens/Capture';
import Results from './screens/Results';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Capture" component={Capture} options={{ headerShown: false }} />
        <Stack.Screen name="Results" component={Results} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
    <Toast />
    </>
  );
}