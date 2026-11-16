import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {
  CAPTIONS,
  CTA,
  CURVE_S4,
  CURVE_S5,
  FPS,
  SCENES,
  SOURCE_NOTE,
  type Caption,
  type Scene,
  type Tone,
} from './timeline';

const {fontFamily: SERIF} = loadPlayfair('normal', {weights: ['500', '600'], subsets: ['latin', 'vietnamese']});
const {fontFamily: SANS} = loadInter('normal', {weights: ['400', '600'], subsets: ['latin', 'vietnamese']});

const C = {
  cream: '#F4F1EA',
  creamText: '#F6EEDC',
  brown: '#3E2723',
  gold: '#B08D57',
  goldDeep: '#8A6A3B',
};

const FADE = 0.6; // giây chuyển cảnh
const f = (sec: number) => Math.round(sec * FPS);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Dải chữ: khoảng 56%–80% chiều cao khung hình
const TEXT_TOP = 1080;
const TEXT_HEIGHT = 470;

/* ---------- Lớp phủ ---------- */

const Glow: React.FC<{x: number; y: number; size: number}> = ({x, y, size}) => {
  const frame = useCurrentFrame();
  const o = 0.32 + 0.14 * Math.sin(frame / 22);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${x}% ${y}%, rgba(255,205,130,0.55) 0%, rgba(255,190,110,0.18) ${size * 0.45}%, rgba(255,190,110,0) ${size}%)`,
        mixBlendMode: 'screen',
        opacity: o,
      }}
    />
  );
};

const Dust: React.FC<{count: number; seed: string; tone: Tone}> = ({count, seed, tone}) => {
  const frame = useCurrentFrame();
  const color = tone === 'dark' ? '255,232,190' : '255,244,220';
  return (
    <AbsoluteFill>
      {new Array(count).fill(0).map((_, i) => {
        const x0 = random(`${seed}x${i}`) * 100;
        const y0 = random(`${seed}y${i}`) * 100;
        const speed = 0.015 + random(`${seed}s${i}`) * 0.03; // % mỗi frame
        const size = 2 + random(`${seed}z${i}`) * 5;
        const phase = random(`${seed}p${i}`) * Math.PI * 2;
        const y = (((y0 - frame * speed) % 100) + 100) % 100;
        const x = x0 + Math.sin(frame / 55 + phase) * 1.6;
        const o = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(frame / 18 + phase));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: '50%',
              background: `rgba(${color},${o})`,
              filter: 'blur(1px)',
              boxShadow: `0 0 ${size * 2}px rgba(${color},${o * 0.6})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => (
  <AbsoluteFill style={{opacity: 0.07, mixBlendMode: 'multiply', pointerEvents: 'none'}}>
    <svg width="1080" height="1920">
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);

const Vignette: React.FC<{tone: Tone}> = ({tone}) => (
  <AbsoluteFill
    style={{
      background:
        tone === 'dark'
          ? 'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 55%, rgba(10,6,4,0.42) 100%)'
          : 'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 60%, rgba(62,39,35,0.14) 100%)',
    }}
  />
);

const TextBand: React.FC<{tone: Tone}> = ({tone}) => {
  const c = tone === 'dark' ? 'rgba(18,12,8,0.40)' : 'rgba(244,241,234,0.50)';
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: TEXT_TOP - 60,
        height: TEXT_HEIGHT + 120,
        background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, ${c} 28%, ${c} 72%, rgba(0,0,0,0) 100%)`,
      }}
    />
  );
};

/* ---------- Đường cong cortisol ---------- */

const drawn = (frame: number, a: number, b: number) =>
  interpolate(frame, [f(a), f(b)], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});

const CurveS4: React.FC<{sceneStart: number}> = ({sceneStart}) => {
  const frame = useCurrentFrame() + f(sceneStart); // về thời gian tuyệt đối
  const rise = drawn(frame, CURVE_S4.drawStart, CURVE_S4.peakAt);
  const fall = drawn(frame, CURVE_S4.peakAt, CURVE_S4.drawEnd);
  const axisO = interpolate(frame, [f(CURVE_S4.labelsAt), f(CURVE_S4.labelsAt + 0.6)], [0, 1], clamp);
  const peakO = interpolate(frame, [f(CURVE_S4.peakAt - 0.2), f(CURVE_S4.peakAt + 0.4)], [0, 1], clamp);
  const stroke = '#7A4E22';
  const glow = 'drop-shadow(0 0 10px rgba(255,226,160,0.95))';
  return (
    <svg width="1080" height="1920" style={{position: 'absolute', inset: 0}}>
      <g opacity={axisO}>
        <line x1={340} y1={700} x2={950} y2={700} stroke={stroke} strokeOpacity={0.35} strokeWidth={3} strokeDasharray="10 10" />
        <text x={340} y={748} fontFamily={SANS} fontSize={30} fill="#4A2E1A">thức dậy</text>
      </g>
      <path d="M 360 690 C 470 690, 540 280, 650 280" fill="none" stroke={stroke} strokeWidth={9} strokeLinecap="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - rise} style={{filter: glow}} />
      <path d="M 650 280 C 790 280, 870 470, 940 520" fill="none" stroke={stroke} strokeWidth={9} strokeLinecap="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - fall} style={{filter: glow}} />
      <g opacity={peakO}>
        <circle cx={650} cy={280} r={13} fill={C.gold} stroke={stroke} strokeWidth={4} />
        <text x={650} y={232} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={34} fill="#4A2E1A">30–45 phút</text>
      </g>
    </svg>
  );
};

const CurveS5: React.FC<{sceneStart: number}> = ({sceneStart}) => {
  const frame = useCurrentFrame() + f(sceneStart);
  const oldO = interpolate(frame, [f(sceneStart + 0.3), f(sceneStart + 1.2)], [0, 1], clamp);
  const spike = drawn(frame, CURVE_S5.spikeStart, CURVE_S5.spikeEnd);
  const pulse = spike >= 1 ? 0.75 + 0.25 * Math.sin(frame / 6) : 1;
  return (
    <svg width="1080" height="1920" style={{position: 'absolute', inset: 0}}>
      <g opacity={oldO}>
        <line x1={120} y1={610} x2={870} y2={610} stroke={C.creamText} strokeOpacity={0.3} strokeWidth={3} strokeDasharray="10 10" />
        <path d="M 140 600 C 250 600, 360 380, 480 380 C 620 380, 740 500, 840 520" fill="none"
          stroke={C.creamText} strokeOpacity={0.38} strokeWidth={7} strokeLinecap="round" />
      </g>
      <path d="M 140 600 C 230 600, 330 150, 470 150 C 620 150, 740 300, 840 330" fill="none"
        stroke="#E8C27A" strokeWidth={10} strokeLinecap="round" opacity={pulse}
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - spike}
        style={{filter: 'drop-shadow(0 0 14px rgba(232,170,90,0.9))'}} />
    </svg>
  );
};

/* ---------- Cảnh ---------- */

const SceneLayer: React.FC<{scene: Scene; first: boolean}> = ({scene, first}) => {
  const frame = useCurrentFrame();
  const dur = f(scene.end + FADE - scene.start);
  const opacity = first ? 1 : interpolate(frame, [0, f(FADE)], [0, 1], clamp);
  const scale = interpolate(frame, [0, dur], [scene.zoomFrom, scene.zoomTo], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  return (
    <AbsoluteFill style={{opacity, backgroundColor: C.brown}}>
      <AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: scene.origin}}>
        <Img src={staticFile(scene.img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        {scene.glow ? <Glow {...scene.glow} /> : null}
        {scene.id === 's4' ? <CurveS4 sceneStart={scene.start} /> : null}
        {scene.id === 's5' ? <CurveS5 sceneStart={scene.start} /> : null}
      </AbsoluteFill>
      <Vignette tone={scene.tone} />
      <Dust count={scene.dust} seed={scene.id} tone={scene.tone} />
      <TextBand tone={scene.tone} />
    </AbsoluteFill>
  );
};

/* ---------- Chữ ---------- */

const CaptionView: React.FC<{c: Caption}> = ({c}) => {
  const frame = useCurrentFrame();
  const dur = f(c.end - c.start);
  const inO = interpolate(frame, [0, f(0.35)], [0, 1], clamp);
  const outO = interpolate(frame, [dur - f(0.25), dur], [1, 0], clamp);
  const y = interpolate(frame, [0, f(0.45)], [14, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const dark = c.tone === 'dark';
  return (
    <AbsoluteFill
      style={{
        top: TEXT_TOP,
        height: TEXT_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 90px',
      }}
    >
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 500,
          fontSize: 64,
          lineHeight: 1.32,
          textAlign: 'center',
          whiteSpace: 'pre-line',
          color: dark ? C.creamText : C.brown,
          textShadow: dark ? '0 2px 18px rgba(0,0,0,0.6)' : '0 1px 12px rgba(244,241,234,0.9)',
          opacity: Math.min(inO, outO),
          transform: `translateY(${y}px)`,
        }}
      >
        {c.text}
      </div>
    </AbsoluteFill>
  );
};

const SourceNote: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = f(SOURCE_NOTE.end - SOURCE_NOTE.start);
  const o = Math.min(
    interpolate(frame, [0, f(0.5)], [0, 1], clamp),
    interpolate(frame, [dur - f(0.4), dur], [1, 0], clamp),
  );
  return (
    <div
      style={{
        position: 'absolute',
        top: TEXT_TOP + TEXT_HEIGHT - 50,
        width: '100%',
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 26,
        color: C.creamText,
        opacity: o * 0.75,
        letterSpacing: 0.5,
      }}
    >
      Nguồn: {SOURCE_NOTE.text}
    </div>
  );
};

/* ---------- CTA ---------- */

// Đoạn quay màn hình: 5,0 giây, phát chậm một chút để phủ hết cảnh CTA
const REC = {offset: 0.15, length: 5.0, rate: 0.96};

const appear = (frame: number, at: number, d = 0.45) =>
  interpolate(frame, [f(at), f(at + d)], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

const CtaScene: React.FC = () => {
  const local = useCurrentFrame();
  const frame = local + f(CTA.start);
  const bgO = interpolate(local, [0, f(FADE)], [0, 1], clamp);
  const recO = interpolate(local, [f(REC.offset), f(REC.offset + 0.5)], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const t1 = appear(frame, 52.0);
  const t2 = appear(frame, 53.3);
  const t3 = appear(frame, 54.2);
  const t4 = appear(frame, 54.6);
  return (
    <AbsoluteFill style={{opacity: bgO, backgroundColor: C.cream}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 30%, rgba(176,141,87,0.22), rgba(176,141,87,0) 60%)'}} />
      {/* Quay màn hình thật diagnostic.html (1116.mp4, đã cắt bỏ thanh cuộn và nút tròn) */}
      <div
        style={{
          position: 'absolute',
          left: 280,
          top: 150,
          width: 520,
          height: 820,
          borderRadius: 36,
          overflow: 'hidden',
          border: '1px solid rgba(62,39,35,0.18)',
          boxShadow: '0 24px 60px rgba(62,39,35,0.22)',
          opacity: recO,
          transform: `translateY(${(1 - recO) * 18}px)`,
        }}
      >
        <Img src={staticFile('rec_last.png')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover'}} />
        <Sequence from={f(REC.offset)} durationInFrames={Math.floor(f(REC.length / REC.rate)) - 1} layout="none">
          <OffthreadVideo
            src={staticFile('rec.mp4')}
            muted
            playbackRate={REC.rate}
            style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover'}}
          />
        </Sequence>
      </div>
      <div style={{position: 'absolute', top: 1060, width: '100%', textAlign: 'center'}}>
        <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 88, color: C.brown, opacity: t1, transform: `translateY(${(1 - t1) * 16}px)`}}>
          Bạn thuộc kiểu nào?
        </div>
        <div style={{fontFamily: SERIF, fontWeight: 500, fontSize: 60, color: C.goldDeep, marginTop: 18, opacity: t2, transform: `translateY(${(1 - t2) * 12}px)`}}>
          6 câu hỏi. 3 phút.
        </div>
        <div style={{fontFamily: SANS, fontSize: 30, color: 'rgba(62,39,35,0.75)', marginTop: 34, opacity: t3}}>
          Cuối bài, nhập email để nhận bức thư chẩn đoán.
        </div>
        <div
          style={{
            display: 'inline-block',
            marginTop: 40,
            padding: '22px 64px',
            borderRadius: 100,
            background: C.brown,
            color: C.cream,
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 36,
            opacity: t4,
            transform: `scale(${0.94 + 0.06 * t4})`,
          }}
        >
          Tìm hiểu thêm
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Ghép ---------- */

export const Ad2: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.brown}}>
    {SCENES.map((scene, i) => (
      <Sequence key={scene.id} from={f(scene.start)} durationInFrames={f(scene.end + FADE - scene.start)} name={scene.id}>
        <SceneLayer scene={scene} first={i === 0} />
      </Sequence>
    ))}
    {CAPTIONS.map((c, i) => (
      <Sequence key={`c${i}`} from={f(c.start)} durationInFrames={f(c.end - c.start)} name={`chu-${i + 1}`}>
        <CaptionView c={c} />
      </Sequence>
    ))}
    <Sequence from={f(SOURCE_NOTE.start)} durationInFrames={f(SOURCE_NOTE.end - SOURCE_NOTE.start)} name="nguon">
      <SourceNote />
    </Sequence>
    <Sequence from={f(CTA.start)} durationInFrames={f(CTA.end - CTA.start)} name="cta">
      <CtaScene />
    </Sequence>
    <Grain />
    <Audio src={staticFile('voice.wav')} />
  </AbsoluteFill>
);
