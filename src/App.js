import React, { useState, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppLoading from 'expo-app-loading';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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
    await diviaApi.init();
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