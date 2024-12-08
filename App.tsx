import React from 'react';
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
