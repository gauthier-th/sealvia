import 'react-native-get-random-values'
import React, { useState, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppLoading from 'expo-app-loading';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlobalStore, { Context } from './GlobalStore';
import Home from './components/Home';
import StopSelector from './components/StopSelector';

const Stack = createStackNavigator();

const screenOptions = {
  // headerTitleAlign: 'center'
};

export default function App() {
  const { diviaApi } = useContext(Context);
  const [isReady, setReady] = useState(false);

  const _cacheResourcesAsync = async () => {
    const value = await AsyncStorage.getItem('@divia_data');
    if (value !== null) {
      const data = JSON.parse(value);
      if (Date.now() - data.timestamp < 7*24*60*60*1000) {
        diviaApi.reseau = data.reseau;
        return;
      }
    }
    await diviaApi.init();
    const reseau = Object.assign({}, diviaApi.reseau);
    delete reseau.communes;
    delete reseau.poles;
    delete reseau.dessertes;
    delete reseau.services;
    delete reseau.liaisons;
    const cache = {
      timestamp: Date.now(),
      reseau
    };
    await AsyncStorage.setItem('@divia_data', JSON.stringify(cache));
  }

  return <GlobalStore>
    {!isReady && <AppLoading
      startAsync={_cacheResourcesAsync}
      onFinish={() => setReady(true)}
      onError={console.error}
    />}
    {isReady && <>
      <StatusBar style='auto' />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name='Home' component={Home} options={{ ...screenOptions, title: 'Sealvia', headerShown: false }} initialParams={{ diviaApi }} />
          <Stack.Screen name='StopSelector' component={StopSelector} options={{ ...screenOptions, title: 'Sélectionnez un arrêt' }} initialParams={{ diviaApi }} />
        </Stack.Navigator>
      </NavigationContainer>
    </>}
  </GlobalStore>;
}