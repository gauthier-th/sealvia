import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { View, ConnectionStatusBar, Text, Button, Colors, Card } from 'react-native-ui-lib';
import Constants from 'expo-constants';
import { Context } from '../GlobalStore';
import { AntDesign } from '@expo/vector-icons';

const plusIcon = require('../../assets/icons/plus.png');

ConnectionStatusBar.registerGlobalOnConnectionLost();

export default function Home({ navigation, route }) {
  const [refreshing, setRefreshing] = useState(false);
  const { database, diviaApi } = useContext(Context);

  const [isConnected, setConnected] = useState(true);
  const [favorites, setFavorites] = useState(null);

  useEffect(() => {
    database.listFavorite()
      .then(result => setFavorites(result.rows._array))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (route.params?.stopSelector) {
      const { line, stop, direction } = route.params?.stopSelector;
      if (favorites.find(fav => fav.line === line && fav.stop === stop && fav.direction === direction))
        return;
      database.addFavorite(line, stop, direction).then(({ insertId: id }) => {
        setFavorites([
          ...favorites,
          { id, line, stop, direction }
        ])
      });
    }
  }, [route.params?.stopSelector]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };
  setTimeout(() => setRefreshing(false), 1000);

  return <ScrollView
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    style={{ ...styles.container, ...(isConnected ? {} : { paddingTop: 35 }) }}
  >
    <ConnectionStatusBar
      label='Aucune connexion internet.'
      onConnectionChange={setConnected}
    />
    <View style={styles.content}>
      <View style={styles.category}>
        <Text text50>Bienvenue</Text>
      </View>
      <View style={styles.category} left>
        <Text text50 style={{ marginBottom: 16 }}>Favoris</Text>
        {favorites === null && <>
          <ActivityIndicator size='large' color={Colors.blue20} />
        </>}
        {favorites !== null && <>
          <View flex row spread style={{ margin: -5, flexWrap: 'wrap' }}>
            {favorites.map(favorite => <PassageCard key={favorite.id} favorite={favorite} diviaApi={diviaApi} refreshing={refreshing} />)}
          </View>
          <Button
            outlineColor={Colors.blue20}
            style={styles.button}
            label='Nouveau favori'
            outline
            iconSource={plusIcon}
            onPress={() => navigation.navigate('StopSelector', {
              // onGoBack: async (line, stop, direction) => {
              //   if (favorites.find(fav => fav.line === line && fav.stop === stop && fav.direction === direction))
              //     return;
              //   database.addFavorite(line, stop, direction).then(({ insertId: id }) => {
              //     setFavorites([
              //       ...favorites,
              //       { id, line, stop, direction }
              //     ])
              //   });
              // }
            })}
          />
        </>}
      </View>
    </View>
  </ScrollView>;
};

/**
 * @param {{ diviaApi: import('@gauthier-th/divia-api-v2') }} params 
 */
const PassageCard = ({ favorite, diviaApi, refreshing }) => {
  const [passages, setPassages] = useState(null);

  const line = diviaApi.getLine(favorite.line);
  const stop = line.getStop(favorite.stop);

  useEffect(() => {
    stop.totem().then(setPassages);
  }, []);
  useEffect(() => {
    if (refreshing === true) {
      setPassages(null);
      stop.totem().then(setPassages);
    }
  }, [refreshing]);

  return <View style={{ flexBasis: '50%' }}>
    <Card
      row
      margin-5
      style={{ height: 'auto' }}
      onPress={() => {}}
      borderRadius={10}
      useNative
      backgroundColor={Colors.white}
      activeOpacity={1}
      // activeScale={0.96}
    >
      <View paddingH-10 paddingV-10>
        <Text text60 grey10>
          {line.data.nom_commercial} - {stop.data.nom}
        </Text>
        <View row marginT-5>
          <AntDesign name="arrowright" size={24} color="black" />
          <Text text70 grey10 marginL-6>{line.data.direction}</Text>
        </View>
        <View row spread marginT-5>
          {(() => {
            if (passages === null)
              return <ActivityIndicator size='small' color={Colors.blue20} />;
            else if (passages.length === 0)
              return <Text>Aucun passage.</Text>;
            else {
              return passages.map(passage => (
                <Text key={passage['@id']} text65>{passage.duree}</Text>
              ));
            }
          })()}
          <Text></Text>
        </View>
      </View>
    </Card>
  </View>
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