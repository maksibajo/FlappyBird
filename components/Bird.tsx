import {useImage, Image, Group} from '@shopify/react-native-skia';
import {useEffect, useMemo, useState} from 'react';
import Images from './Images.ts';
import {
  Extrapolation,
  interpolate, SharedValue,
  useDerivedValue,
} from 'react-native-reanimated';

type BirdProps = {
  isGameOver: boolean
  birdY: SharedValue<number>
  birdX: number
  birdYVelocity: SharedValue<number>
  width: number
}

const Bird = ({isGameOver = false, birdY, birdX, birdYVelocity, width}: BirdProps) => {
  const [pose, setPose] = useState(1);

  const birdCry = useImage(Images.bird3);
  const bird = useImage(Images.bird1);
  const bird2 = useImage(Images.bird2);
  const bird3 = useImage(Images.bird3);

  const image = useMemo(() => {
    if (isGameOver) {
      return birdCry;
    }
    switch (pose) {
      case 2:
        return bird2;
      case 3:
        return bird3;
      default:
        return bird;
    }
  }, [bird, bird2, bird3, birdCry, isGameOver, pose]);

  const birdTransform = useDerivedValue(() => {
    return [
      {
        rotate: interpolate(
          birdYVelocity.value,
          [-500, 500],
          [-0.5, 0.5],
          Extrapolation.CLAMP,
        ),
      },
    ];
  });
  const birdOrigin = useDerivedValue(() => {
    return {x: width / 4 + 32, y: birdY.value + 24};
  });

  useEffect(() => {
    if (!isGameOver) {
      const timer = setInterval(() => {
        setPose((prevPose) => {
          if (prevPose === 3) {
            return 1;
          } else {
            return prevPose + 1;
          }
        });
      }, 140);
      return () => clearInterval(timer);
    }
  }, [isGameOver, pose]);

  return (
    <Group transform={birdTransform} origin={birdOrigin}>
      <Image image={image} y={birdY} x={birdX} width={64} height={48} />
    </Group>
  );
};
export default Bird;
