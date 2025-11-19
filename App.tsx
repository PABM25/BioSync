// App.js
import React from 'react';
import { LogBox } from 'react-native';
import { ThemeProvider } from '@rneui/themed';
import RootNavigator from './src/navigation/RootNavigator';
import { theme } from './src/styles/theme';

// Ignorar warnings específicos (opcional)
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <RootNavigator />
    </ThemeProvider>
  );
};

export default App;
