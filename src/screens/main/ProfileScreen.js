import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Avatar, Text } from '@rneui/themed';
import authService from '../../services/authService';
import { colors, spacing } from '../../styles';

const ProfileScreen = () => {
  const handleLogout = () => {
    authService.logout();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar
          size={100}
          rounded
          icon={{ name: 'user', type: 'font-awesome' }}
          containerStyle={{ backgroundColor: colors.textSecondary }}
        />
        <Text h4 style={{ marginTop: 10 }}>Usuario BioSync</Text>
      </View>
      
      <Button 
        title="Cerrar Sesión" 
        onPress={handleLogout} 
        buttonStyle={{ backgroundColor: colors.error, borderRadius: 8 }}
        containerStyle={{ marginTop: 50, marginHorizontal: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', marginTop: 50 }
});

export default ProfileScreen;