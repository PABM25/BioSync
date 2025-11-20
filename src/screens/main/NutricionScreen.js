// src/screens/main/NutricionScreen.js
import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Card, ListItem, Icon, Button } from '@rneui/themed';
import nutritionService from '../../services/nutritionService';
import { colors, spacing, typography } from '../../styles';
import { format } from 'date-fns';

const NutricionScreen = ({ navigation, userUid }) => {
  const [comidas, setComidas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarComidas();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarComidas = async () => {
    setLoading(true);
    try {
      const fechaHoy = format(new Date(), 'yyyy-MM-dd');
      const data = await nutritionService.obtenerComidasDelDia(userUid, fechaHoy);
      setComidas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderSeccion = (titulo, listaComidas) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{titulo}</Text>
      {listaComidas && listaComidas.length > 0 ? (
        listaComidas.map((item, i) => (
          <ListItem key={i} bottomDivider containerStyle={styles.listItem}>
            <ListItem.Content>
              <ListItem.Title style={styles.itemTitle}>{item.nombre}</ListItem.Title>
              <ListItem.Subtitle style={styles.itemSubtitle}>
                {item.calorias} kcal | P: {item.proteinas}g
              </ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
        ))
      ) : (
        <Text style={styles.emptyText}>No hay registros</Text>
      )}
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{marginTop: 50}} />;

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.tipsCard}>
        <Card.Title>💡 Tip Nutricional del PDF</Card.Title>
        <Text style={styles.tipText}>
          "Evita preparaciones fritas. Prefiere a la plancha, al horno o al vapor. Aumenta el consumo de agua a 2 litros diarios."
        </Text>
      </Card>

      {renderSeccion('🍳 Desayuno', comidas?.desayuno)}
      {renderSeccion('🥗 Almuerzo', comidas?.almuerzo)}
      {renderSeccion('🍎 Merienda', comidas?.merienda)}
      {renderSeccion('🌙 Cena', comidas?.cena)}

      <Button
        title="Agregar Nuevo Alimento"
        icon={{ name: 'plus', type: 'feather', color: 'white' }}
        buttonStyle={styles.fab}
        onPress={() => navigation.navigate('AgregarComida')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { fontSize: typography.h4, fontWeight: 'bold', color: colors.primary, marginBottom: spacing.sm },
  listItem: { borderRadius: 8, backgroundColor: colors.surface },
  itemTitle: { fontWeight: '600' },
  itemSubtitle: { color: colors.textSecondary, fontSize: 12 },
  emptyText: { fontStyle: 'italic', color: colors.textSecondary, marginLeft: spacing.sm },
  tipsCard: { borderRadius: 10, backgroundColor: '#e0f2fe', borderColor: 'transparent', marginBottom: spacing.xl },
  tipText: { textAlign: 'center', color: '#0369a1' },
  fab: { backgroundColor: colors.primary, margin: spacing.lg, borderRadius: 8 }
});

export default NutricionScreen;