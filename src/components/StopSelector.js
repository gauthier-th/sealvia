import React, { useEffect, useState, useContext, useMemo } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { View, Text, Button, Colors, RadioGroup, RadioButton } from 'react-native-ui-lib';
import { Picker } from '@react-native-picker/picker';
import { Context } from '../GlobalStore';

export default function StopSelector({ navigation, route }) {
  const { diviaApi } = useContext(Context);
  const [line, setLine] = useState(diviaApi.lines[0].id);
  const [direction, setDirection] = useState('A');
  const [stop, setStop] = useState(diviaApi.getLine(diviaApi.lines[0].id).stops[0].id);
  const lines = useMemo(() => {
    const result = [];
    for (let ln of diviaApi.lines) {
      if (!result.find(l => l.codetotem === ln.codetotem))
        result.push(ln);
    }
    return result.map(ln => (
      <Picker.Item
        key={ln.id}
        value={ln.id}
        label={ln.nom_commercial}
      />
    ));
  }, []);

  const stops = useMemo(() => {
    if (!line)
      return [];
    return diviaApi.getLine(line).stops.sort(sortStops).map(st => (
      <Picker.Item
        key={st.id}
        value={st.id}
        label={st.nom}
      />
    ));
  }, [line]);

  const getOtherDirection = (id) => {
    const ln1 = diviaApi.getLine(id);
    return diviaApi.lines.find(ln => ln.codetotem === ln1.data.codetotem && ln.senstotem !== ln1.data.senstotem);
  };
  const getDirectionLines = (id) => {
    const originalLine = diviaApi.getLine(id);
    const ln1 = diviaApi.lines.find(ln => ln.codetotem === originalLine.data.codetotem && ln.senstotem === 'A');
    const ln2 = diviaApi.lines.find(ln => ln.codetotem === originalLine.data.codetotem && ln.senstotem === 'R');
    return [ln1, ln2];
  };

  const changeDirection = (dir) => {
    if (dir && dir !== direction) {
      const ln = getOtherDirection(line);
      setLine(ln.id);
      setDirection(dir);

      const orignalStop = diviaApi.getLine(line).getStop(stop);
      const newStop = diviaApi.getLine(ln.id).stops.find(st => st.nom === orignalStop.data.nom);
      if (newStop)
        setStop(newStop.id)
      else
        setStop(diviaApi.getLine(ln.id).stops[0].id);
    }
  };

  const updateStop = (ln) => {
    const orignalStop = diviaApi.getLine(line).getStop(stop);
    const newStop = diviaApi.getLine(ln).stops.find(st => st.nom === orignalStop.data.nom);
    if (newStop)
      setStop(newStop.id)
    else
      setStop(diviaApi.getLine(ln).stops[0].id);
  }

  const goBack = () => {
    navigation.navigate('Home', { stopSelector: { line, stop, code: diviaApi.getLine(line).data.codetotem, direction } });
  };

  return <ScrollView style={styles.container}>
    <View style={styles.content}>
      <View style={styles.pickerView}>
        <Text text70>Ligne :</Text>
        <Picker
          selectedValue={line}
          onValueChange={value => { updateStop(value); setLine(value); }}
          mode='dropdown'
          style={styles.dropdown}
        >
          {lines}
        </Picker>
      </View>

      <View style={styles.pickerView}>
        <Text text70>Direction :</Text>
        <RadioGroup
          initialValue={direction}
          value={direction}
          onValueChange={changeDirection}
          style={{ marginVertical: 16 }}
          color={Colors.blue20}
        >
          <RadioButton value='A' label={getDirectionLines(line)[0].direction} />
          <RadioButton value='R' label={getDirectionLines(line)[1].direction} style={{ marginTop: 8 }} labelStyle={{ marginTop: 8 }} />
        </RadioGroup>
      </View>

      <View style={styles.pickerView}>
        <Text text70>Arr??t :</Text>
        <Picker
          selectedValue={stop}
          onValueChange={setStop}
          mode='dropdown'
          style={styles.dropdown}
        >
          {stops}
        </Picker>
      </View>
      
      <View center>
        <Button
          outlineColor={Colors.blue20}
          style={styles.button}
          label="Valider"
          outline
          onPress={goBack}
        />
      </View>
    </View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: {},
  content: {
    padding: 10
  },
  pickerView: {
    // display: 'flex',
    // justifyContent: 'space-between',
    // flexDirection: 'row'
  },
  dropdown: {
    // width: 200,
    margin: 0,
    padding: 0
  },
  button: {
    marginVertical: 10,
    borderRadius: 10
  }
});

function sortStops(stop1, stop2) {
  return stop1.nom.localeCompare(stop2.nom);
}