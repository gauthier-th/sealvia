import React, { useState, useCallback, useContext } from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, View, Colors, Card, Button } from 'react-native-ui-lib';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { Context } from '../GlobalStore';
import { AntDesign } from '@expo/vector-icons';

export default function FavoritesOrder({ navigation, route }) {
  const { diviaApi, database } = useContext(Context);
  const favorites = route.params?.favorites;
  const [data, setData] = useState(favorites);
  const [toDelete, setToDelete] = useState([]);

  const deleteItem = (id, index) => {
    setToDelete([ ...toDelete, id ]);
    setData(data.filter((_, i) => i !== index));
  };

  const renderItem = useCallback(({ item, index, drag, isActive }) => {
    const line = diviaApi.getLine(item.line);
    const stop = line.getStop(item.stop);
    return <TouchableOpacity
      activeOpacity={0.8}
      style={{ alignItems: 'flex-start', justifyContent: 'center', marginTop: 12 }}
      onLongPress={drag}>
      <View style={{ width: '100%' }} paddingH-10>
        <Card
          row
          style={{ height: 'auto', width: '100%', ...(isActive ? { opacity: 0.8 } : {}) }}
          borderRadius={10}
          useNative
          backgroundColor={Colors.white}
          activeOpacity={1}
          activeScale={1}
        >
          <View row spread style={{ width: '100%' }}>
            <View paddingH-10 paddingV-10>
              <Text text60 grey10>
                {line.data.nom_commercial} - {stop.data.nom}
              </Text>
              <View row marginT-5>
                <Text text70 grey10 marginL-6>{line.data.direction}</Text>
              </View>
            </View>
            <View center>
              <View margin-10>
                <Button
                  round
                  outlineColor={Colors.red20}
                  outline
                  onPress={() => deleteItem(item.id, index)}
                >
                  <AntDesign name="close" size={24} color={Colors.red20} />
                </Button>
              </View>
            </View>
          </View>
        </Card>
      </View>
    </TouchableOpacity>;
  }, []);

  const goBack = async () => {
    for (let delId of toDelete) {
      await database.removeFavorite(delId);
    }
    await database.setOrder(data.map((d, i) => ({ id: d.id, order: i }))).catch(() => console.error);
    navigation.navigate('Home', { favoriteOrder: Date.now() });
  };

  if (data.length > 0) {
    return <>
      <DraggableFlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `draggable-item-${item.id}`}
        onDragEnd={({ data }) => setData(data)}
      />
      <Button
        margin-8
        style={{ borderRadius: 10 }}
        backgroundColor={Colors.blue20}
        label='Sauvegarder'
        onPress={goBack}
      />
    </>;
  }
  else {
    return <View center>
      <Text marginT-10 text60>Aucun favori pour le moment.</Text>
    </View>;
  }
};