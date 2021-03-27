import React, { useState, useEffect, useContext, useCallback } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { View, ConnectionStatusBar, Text, Button, Colors, Card } from 'react-native-ui-lib';
import Constants from 'expo-constants';
import { Context } from '../GlobalStore';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

const plusIcon = require('../../assets/icons/plus.png');

export default function Home({ navigation, route }) {
  const [refreshing, setRefreshing] = useState(false);
  const { database, diviaApi } = useContext(Context);

  const [isConnected, setConnected] = useState(true);
  const [favorites, setFavorites] = useState(null);

  useEffect(() => {
    database.listFavorite()
      .then(result => setFavorites(result.rows._array))
      .catch(e => console.error(e) || setFavorites([]));
  }, []);
 
  useEffect(() => {
    if (route.params?.stopSelector) {
      const { line, stop, code, direction } = route.params?.stopSelector;
      if (favorites.find(fav => fav.line === line && fav.stop === stop))
        return;
      database.addFavorite(line, stop, code, direction).then(({ insertId: id }) => {
        setFavorites([
          ...favorites,
          { id, line, stop, direction }
        ])
      });
    }
  }, [route.params?.stopSelector]);
 
  useEffect(() => {
    if (route.params?.favoriteOrder) {
      database.listFavorite()
        .then(result => setFavorites(result.rows._array))
        .catch(e => console.error(e) || setFavorites([]));
    }
  }, [route.params?.favoriteOrder]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };
  setTimeout(() => setRefreshing(false), 1000);

  return <ScrollView
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[ Colors.blue20 ]} />}
    style={{ ...styles.container, ...(isConnected ? {} : { paddingTop: 35 }) }}
  >
    <ConnectionStatusBar
      label='Aucune connexion internet.'
      onConnectionChange={setConnected}
    />
    <View style={styles.content}>
      <View style={styles.category}>
        <Text text50>{getGreetings()}</Text>
      </View>
      <View style={styles.category} left>
        <View flex row spread marginB-16 style={{ width: '100%' }}>
          <Text text50>Favoris</Text>
          <View flex row right style={{ marginTop: -10 }}>
            {favorites && favorites.length > 1 && <Button
              round
              outlineColor={Colors.blue20}
              outline
              onPress={() => navigation.navigate('FavoritesOrder', { favorites })}
            >
              <FontAwesome name="sort-amount-asc" size={20} color={Colors.blue20} />
            </Button>}
            <Button
              marginL-8
              round
              outlineColor={Colors.blue20}
              outline
              iconSource={plusIcon}
              onPress={() => navigation.navigate('StopSelector')}
            />
          </View>
        </View>
        {favorites === null && <>
          <ActivityIndicator size='large' color={Colors.blue20} />
        </>}
        {favorites !== null && favorites.length === 0 && <>
          <View left style={{ width: '100%' }}>
            <Text text70>Aucun favori pour le moment.</Text>
            <Button
              marginT-10
              style={{ borderRadius: 10 }}
              outlineColor={Colors.blue20}
              outline
              label='Nouveau favori'
              onPress={() => navigation.navigate('StopSelector')}
            />
          </View>
        </>}
        {favorites !== null && favorites.length > 0 && <>
          <View flex row spread style={{ margin: -5, flexWrap: 'wrap' }}>
            {favorites.map(favorite => <PassageCard key={favorite.id} favorite={favorite} diviaApi={diviaApi} refreshing={refreshing} />)}
          </View>
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
      borderRadius={10}
      useNative
      backgroundColor={Colors.white}
      activeOpacity={1}
      // activeScale={0.96}
    >
      <View paddingH-10 paddingV-10 style={{ width: '100%' }}>
        <Text text60 grey10>
          {line.data.nom_commercial} - {stop.data.nom}
        </Text>
        <View row marginT-5>
          <AntDesign name="arrowright" size={20} color="black" />
          <Text text75 grey10 marginL-4>{line.data.direction}</Text>
        </View>
        <View row marginT-5 style={{ justifyContent: 'space-evenly' }}>
          {(() => {
            if (passages === null)
              return <ActivityIndicator size='small' color={Colors.blue20} marginT-8 />;
            else if (passages.length === 0)
              return <Text>Aucun passage.</Text>;
            else {
              return passages.map(passage => (
                <Text key={passage['@id']} text65 color={Colors.blue10}>{passage.duree}</Text>
              ));
            }
          })()}
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
  }
});

function getGreetings() {
  if (new Date().getHours() > 18 || new Date().getHours() < 5)
    return 'Bonsoir';
  else
    return 'Bonjour';
}