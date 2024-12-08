import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Game from './components/Game.tsx';
import {StatusBar} from 'react-native';


function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <Game />
    </SafeAreaProvider>
  );
}

export default App;
