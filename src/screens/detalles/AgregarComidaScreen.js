// src/screens/detalles/AgregarComidaScreen.js
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Input, Button, ButtonGroup } from '@rneui/themed';
import nutritionService from '../../services/nutritionService';
import { colors, spacing, typography } from '../../styles';
import { format } from 'date-fns';

const AgregarComidaScreen = ({ navigation, route }) => {
  const { userUid } = route.params || {}; // Asegúrate de pasar userUid al navegar
  const [nombre, setNombre] = useState('');
  const [calorias, setCalorias] = useState('');
  const [proteinas, setProteinas] = useState('');
  const [carbos, setCarbos] = useState('');
  const [grasas, setGrasas] = useState('');
  const [loading, setLoading] = useState(false);
  
  const horarios = ['desayuno', 'almuerzo', 'merienda', 'cena'];
  const [selectedIndex, setSelectedIndex] = useState(1); // Default Almuerzo

  const handleGuardar = async () => {
    if (!nombre || !calorias) {
      Alert.alert('Error', 'El nombre y las calorías son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const comida = {
        nombre,
        calorias: parseInt(calorias),
        proteinas: parseInt(proteinas) || 0,
        carbohidratos: parseInt(carbos) || 0,
        grasas: parseInt(grasas) || 0
      };

      // Usamos una fecha fija o la de hoy
      const fechaHoy = format(new Date(), 'yyyy-MM-dd');
      
      // Importante: Necesitas el UID del usuario. 
      // Si usas context o redux mejor, si no, pásalo por params.
      // Aquí asumo que auth.currentUser está disponible en firebase config
      const { auth } = require('../../config/firebase'); 
      const uid = auth.currentUser ? auth.currentUser.uid : userUid;

      await nutritionService.agregarComida(uid, fechaHoy, horarios[selectedIndex], comida);
      
      Alert.alert('Éxito', 'Comida registrada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la comida');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Tipo de Comida</Text>
      <ButtonGroup
        buttons={['Desayuno', 'Almuerzo', 'Merienda', 'Cena']}
        selectedIndex={selectedIndex}
        onPress={setSelectedIndex}
        containerStyle={styles.buttonGroup}
        selectedButtonStyle={{ backgroundColor: colors.primary }}
      />

      <Input
        label="Nombre del Alimento"
        placeholder="Ej. Pollo con Arroz"
        value={nombre}
        onChangeText={setNombre}
      />

      <View style={styles.row}>
        <View style={styles.col}>
          <Input
            label="Calorías"
            placeholder="kcal"
            keyboardType="numeric"
            value={calorias}
            onChangeText={setCalorias}
          />
        </View>
        <View style={styles.col}>
          <Input
            label="Proteínas (g)"
            placeholder="g"
            keyboardType="numeric"
            value={proteinas}
            onChangeText={setProteinas}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Input
            label="Carbohidratos (g)"
            placeholder="g"
            keyboardType="numeric"
            value={carbos}
            onChangeText={setCarbos}
          />
        </View>
        <View style={styles.col}>
          <Input
            label="Grasas (g)"
            placeholder="g"
            keyboardType="numeric"
            value={grasas}
            onChangeText={setGrasas}
          />
        </View>
      </View>

      <Button
        title="Guardar Comida"
        onPress={handleGuardar}
        loading={loading}
        buttonStyle={styles.saveButton}
        icon={{ name: 'save', type: 'feather', color: 'white' }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  label: { fontSize: typography.body, fontWeight: 'bold', color: colors.textSecondary, marginBottom: spacing.sm, marginLeft: 10 },
  buttonGroup: { marginBottom: spacing.lg, borderRadius: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { width: '48%' },
  saveButton: { backgroundColor: colors.success, borderRadius: 8, marginTop: spacing.lg, paddingVertical: spacing.md }
});

export default AgregarComidaScreen;