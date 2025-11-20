import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Icon } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles';

const SaludScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Monitor de Salud</Text>
      <Card containerStyle={styles.card}>
        <Card.Title>Hidratación</Card.Title>
        <View style={{ alignItems: 'center' }}>
          <Icon name="drop" type="entypo" color={colors.blue} size={50} />
          <Text style={{ marginTop: 10 }}>Meta diaria: 2000ml</Text>
        </View>
      </Card>
      <Card containerStyle={styles.card}>
        <Card.Title>Peso Actual</Card.Title>
        <View style={{ alignItems: 'center' }}>
           <Text style={{ fontSize: 30, fontWeight: 'bold' }}>-- kg</Text>
           <Text>Actualiza tu peso en el perfil</Text>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  header: { fontSize: typography.h2, fontWeight: 'bold', marginVertical: spacing.md, textAlign: 'center' },
  card: { borderRadius: 10 }
});

export default SaludScreen;