import React from 'react';
import {StyleSheet, View, Animated, Text, Button, Image, TouchableOpacity} from 'react-native';
import Images from './Images.ts';

type GameStoppedProps = {
  isPaused: boolean
  score: number
  onPlay: () => void
}

const GameStopped = ({isPaused, score, onPlay}: GameStoppedProps) => {
  return (
    <View style={styles.root}>
      <Animated.View style={styles.container}>
        <Image
          resizeMode={'contain'}
          source={isPaused ? Images.bird1 : Images.bird1}
          style={styles.image}
        />
        <Text style={styles.score}>
          Score: {score?.toString()}
        </Text>
        <Text style={styles.title}>
          {isPaused ? 'Game Paused' : "Game Over"}
        </Text>
        <TouchableOpacity activeOpacity={0.7} style={styles.button} onPress={onPlay}>
          <Text style={styles.buttonText}>{isPaused ? 'Continue' : 'Start new game'}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default GameStopped;

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#00000090',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  container: {
    backgroundColor: '#ffffff99',
    borderRadius: 2,
    paddingVertical: '20%',
    paddingHorizontal: 24,
    marginHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 4.84,
    elevation: 8,
    gap: 15,
  },
  image: {width: 60, height: 50},
  score: {
    color: 'grey',
    fontSize: 18,
    fontWeight: '700',
  },
  title: {
    color: 'black',
    fontSize: 22,
    fontWeight: '800',
  },
  button: {
    backgroundColor: '#558022',
    height: 55,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    fontWeight: '700',
    color: 'white',
    fontSize: 18,
  },
});
