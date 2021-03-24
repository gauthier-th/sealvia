import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { View, ConnectionStatusBar, Text, Button, Colors } from 'react-native-ui-lib';
import Constants from 'expo-constants';

const plusIcon = require('../../assets/icons/plus.png');

ConnectionStatusBar.registerGlobalOnConnectionLost();

export default function Home({ navigation }) {
  const [isConnected, setConnected] = useState(true);
  return <ScrollView style={{ ...styles.container, ...(isConnected ? {} : { paddingTop: 35 }) }}>
    <ConnectionStatusBar
      label='Aucune connexion internet.'
      onConnectionChange={setConnected}
    />
    <View style={styles.content}>
      <View style={styles.category}>
        <Text text50>Bienvenue</Text>
      </View>
      <View style={styles.category} left>
        <Text text50>Favoris</Text>
        <Button
          outlineColor={Colors.blue20}
          style={styles.button}
          label="Nouveau favori"
          outline
          iconSource={plusIcon}
          onPress={() => navigation.navigate('StopSelector')}
        />
      </View>
    </View>
  </ScrollView>;
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight
  },
  content: {
    padding: 10
  },
  category: {
    marginVertical: 10
  },
  button: {
    marginVertical: 10,
    borderRadius: 10
  }
});