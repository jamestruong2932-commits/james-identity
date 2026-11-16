import React from 'react';
import {Composition} from 'remotion';
import {Ad2} from './Ad2';
import {FPS, TOTAL_SECONDS} from './timeline';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Ad2"
    component={Ad2}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={Math.round(TOTAL_SECONDS * FPS)}
  />
);
