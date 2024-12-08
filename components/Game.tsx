import {
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import {
  Skia,
  Canvas,
  useImage,
  Image,
  matchFont,
  TextBlob,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  withTiming,
  Easing,
  withSequence,
  useFrameCallback,
  useDerivedValue,
  interpolate,
  useAnimatedReaction,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import {useState} from 'react';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Images from './Images.ts';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Bird from './Bird.tsx';
import GameStopped from './GameStopped.tsx';

type Weight =
  | 'normal'
  | 'bold'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

const GRAVITY = 1000;
const JUMP_FORCE = -500;

const pipeWidth = 104;
const pipeHeight = 640;

const HALF_GAP = 110;

const Game = () => {
  const {width, height} = useWindowDimensions();
  const {top, bottom} = useSafeAreaInsets();

  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const bg = useImage(Images.background);
  const pipeTop = useImage(Images.pipeTop);
  const pipeBottom = useImage(Images.pipeBottom);
  const base = useImage(Images.base);

  const gameOver = useSharedValue(true);
  const disableClick = useSharedValue(false);
  const pipeX = useSharedValue(width);

  const birdY = useSharedValue(height / 2.2);
  const birdX = width / 4;
  const birdYVelocity = useSharedValue(0);

  const safeHeight = height - top - bottom;
  const pipeScreenDiff = safeHeight > pipeHeight ? safeHeight - pipeHeight : 0;
  const minOffset = Platform.select({
    ios: 230 - (top + bottom),
    android: 150 + bottom,
    default: 230 - (top + bottom),
  });
  const topOffset = Platform.select({ios: 200, android: 150 + top, default: 200});

  const TOP_MAX = -pipeHeight + pipeScreenDiff + topOffset;
  const TOP_MIN = -minOffset;
  const BOTTOM_MAX = pipeScreenDiff + topOffset;
  const BOTTOM_MIN = pipeHeight - minOffset;

  const MIDDLE_TOP = (TOP_MAX + TOP_MIN) / 2 - HALF_GAP;
  const MIDDLE_BOTTOM = (BOTTOM_MIN + BOTTOM_MAX) / 2 + HALF_GAP;

  const MAX_INTERVAL = BOTTOM_MIN - MIDDLE_BOTTOM + HALF_GAP;
  const MIN_INTERVAL = -MAX_INTERVAL;

  const pipeOffset = useSharedValue(0);
  const topPipeY = useDerivedValue(() => MIDDLE_TOP + pipeOffset.value);
  const bottomPipeY = useDerivedValue(() => MIDDLE_BOTTOM + pipeOffset.value);

  const pipesSpeed = useDerivedValue(() => {
    return interpolate(score, [0, 30], [1, 1.5]);
  });

  const obstacles = useDerivedValue(() => [
    {
      x: pipeX.value,
      y: bottomPipeY.value,
      h: pipeHeight,
      w: pipeWidth,
    },
    {
      x: pipeX.value,
      y: topPipeY.value,
      h: pipeHeight,
      w: pipeWidth,
    },
  ]);

  const moveTheMap = (delay = 0) => {
    setTimeout(() => {
      pipeX.value = withSequence(
        withTiming(width, {duration: 0}),
        withTiming(-150, {
          duration: 3000 / pipesSpeed.value,
          easing: Easing.linear,
        }),
        withTiming(width, {duration: 0}),
      );
    }, delay);
  };

  useAnimatedReaction(
    () => pipeX.value,
    (currentValue, previousValue) => {
      const middle = birdX;

      if (previousValue && currentValue < -100 && previousValue > -100) {
        pipeOffset.value =
          Math.floor(Math.random() * (MAX_INTERVAL - MIN_INTERVAL + 1)) +
          MIN_INTERVAL;
        cancelAnimation(pipeX);
        runOnJS(moveTheMap)();
      }

      if (
        currentValue !== previousValue &&
        previousValue &&
        currentValue <= middle &&
        previousValue > middle
      ) {
        runOnJS(setScore)(score + 1);
      }
    },
  );

  const isPointCollidingWithRect = (
    point: { x: number; y: number },
    rect: { x: number; y: number; w: number; h: number },
  ) => {
    'worklet';

    return (
      point.x + 20 >= rect.x &&
      point.x <= rect.x + rect.w &&
      point.y + 20 >= rect.y &&
      point.y - 20 <= rect.y + rect.h
    );
  };

  useAnimatedReaction(
    () => birdY.value,
    (currentValue: number) => {
      const center = {
        x: birdX + 32,
        y: birdY.value + 24,
      };

      if (currentValue > height - 55 - Math.max(bottom, 20)) {
        gameOver.value = true;
        runOnJS(setIsGameOver)(true);
      }

      const isColliding = obstacles.value.some((rect) =>
        isPointCollidingWithRect(center, rect),
      );
      if (isColliding || currentValue < top) {
        cancelAnimation(pipeX);
        disableClick.value = true;
      }
    },
  );

  useAnimatedReaction(
    () => gameOver.value,
    (currentValue, previousValue) => {
      if (currentValue && !previousValue) {
        cancelAnimation(pipeX);
      }
    },
  );

  useFrameCallback(({timeSincePreviousFrame: dt}) => {
    if (!dt || gameOver.value || isPaused) {
      return;
    }
    birdY.value = birdY.value + (birdYVelocity.value * dt) / 1000;
    birdYVelocity.value = birdYVelocity.value + (GRAVITY * dt) / 1000;
  });

  const restartGame = () => {
    'worklet';
    birdY.value = height / 2.2;
    birdYVelocity.value = 0;
    gameOver.value = false;
    disableClick.value = false;
    pipeX.value = width;
    runOnJS(moveTheMap)(300);
    runOnJS(setScore)(0);
    runOnJS(setIsGameOver)(false);
  };

  const gesture = Gesture.Tap().onStart(() => {
    if (disableClick.value) {
      return;
    }
    if (gameOver.value) {
      restartGame();
    }
    birdYVelocity.value = JUMP_FORCE;
  });

  const fontFamily = Platform.select({ios: 'Helvetica', default: 'serif'});
  const fontStyle = {
    fontFamily,
    fontSize: 72,
    fontWeight: '900' as Weight,
  };
  const font = matchFont(fontStyle);

  const play = () => {
    runOnJS(setIsPaused)(false);
    if (isGameOver || score === 0) {
      restartGame();
    } else {
      runOnJS(moveTheMap)();
    }
  };

  const pause = () => {
    cancelAnimation(pipeX);
    runOnJS(setIsPaused)(true);
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <TouchableOpacity style={styles.pauseButton} onPress={pause}>
        <Icon name={'pause'} size={40} color={'white'} />
      </TouchableOpacity>
      {(isPaused || isGameOver) && (
        <GameStopped
          score={score}
          isPaused={isPaused}
          onPlay={play}
        />
      )}
      <GestureDetector gesture={gesture}>
        <Canvas style={{width, height}}>
          <Image image={bg} width={width} height={height} fit={'cover'} />
          <Image
            image={pipeTop}
            y={topPipeY}
            x={pipeX}
            width={pipeWidth}
            height={pipeHeight}
          />
          <Image
            image={pipeBottom}
            y={bottomPipeY}
            x={pipeX}
            width={pipeWidth}
            height={pipeHeight}
          />
          <Image
            image={base}
            width={width}
            height={150}
            y={height - 55 - Math.max(bottom, 20)}
            x={0}
            fit={'cover'}
          />
          <Bird
            isGameOver={isGameOver}
            birdX={birdX}
            birdY={birdY}
            birdYVelocity={birdYVelocity}
            width={width}
          />
          <TextBlob
            blob={Skia.TextBlob.MakeFromText(score.toString(), font)}
            x={width / 2 - 20}
            y={130}
            color={'white'}
          />
        </Canvas>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};
export default Game;

const styles = StyleSheet.create({
  pauseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: '#558022',
    borderRadius: 8,
    shadowColor: '#00000090',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 4.84,
    elevation: 4,
  },
});
