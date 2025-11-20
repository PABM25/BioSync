// src/screens/main/EjercicioScreen.js
import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card, Button, Icon, ListItem } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles';
import { challengeData } from '../../data/challengeData';

const EjercicioScreen = ({ navigation }) => {
  
  const renderDia = ({ item }) => (
    <Card containerStyle={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.dayTitle}>Día {item.dia}</Text>
          <Text style={styles.workoutTitle}>{item.titulo}</Text>
        </View>
        <Icon name="dumbbell" type="material-community" color={colors.primary} />
      </View>
      
      <View style={styles.divider} />
      
      {item.ejercicios.map((ej, index) => (
        <View key={index} style={styles.exerciseRow}>
          <Text style={styles.exerciseName}>• {ej.nombre}</Text>
          <Text style={styles.exerciseReps}>{ej.tiempo || ej.repeticiones}</Text>
        </View>
      ))}
      
      <Text style={styles.rounds}>🔄 {item.vueltas}</Text>
      
      <Button 
        title="Marcar Completado" 
        type="outline" 
        buttonStyle={styles.button}
        titleStyle={{ fontSize: 12 }}
        onPress={() => alert(`Día ${item.dia} registrado!`)} // Aquí conectarías con userService para guardar progreso
      />
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Reto 45 Días - El Manual del Toro</Text>
      <FlatList
        data={challengeData}
        keyExtractor={item => item.dia.toString()}
        renderItem={renderDia}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerTitle: { fontSize: typography.h3, fontWeight: 'bold', textAlign: 'center', marginVertical: spacing.md, color: colors.primary },
  card: { borderRadius: 12, borderColor: colors.border },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayTitle: { fontSize: typography.caption, color: colors.textSecondary, textTransform: 'uppercase' },
  workoutTitle: { fontSize: typography.h4, fontWeight: 'bold', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  exerciseRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  exerciseName: { fontSize: typography.body, color: colors.text },
  exerciseReps: { fontSize: typography.body, fontWeight: 'bold', color: colors.secondary },
  rounds: { marginTop: spacing.sm, fontStyle: 'italic', color: colors.primary },
  button: { marginTop: spacing.md, borderColor: colors.primary }
});

export default EjercicioScreen;