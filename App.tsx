import React from 'react';
import {StyleSheet} from 'react-native';

import {SafeAreaProvider} from 'react-native-safe-area-context';
import Game from './components/Game.tsx';


function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <Game />
    </SafeAreaProvider>
  );
}

export default App;
