// Mọi mốc thời gian (giây) nằm ở đây. Khi thay giọng đọc, chỉ sửa file này.
// Mốc lấy từ các khoảng lặng trong voice.wav (55,24 giây).

export const FPS = 30;
export const TOTAL_SECONDS = 57;

export type Tone = 'dark' | 'light';

export type Scene = {
  id: string;
  img: string;
  start: number;
  end: number;
  tone: Tone;
  zoomFrom: number;
  zoomTo: number;
  origin: string; // điểm zoom hướng tới, theo % khung hình
  glow?: {x: number; y: number; size: number}; // vệt sáng ấm "thở", theo % khung hình
  dust: number; // số hạt bụi
};

export const SCENES: Scene[] = [
  {id: 's1', img: 'img/s1.png', start: 0, end: 4.25, tone: 'dark', zoomFrom: 1.06, zoomTo: 1.16, origin: '45% 42%', glow: {x: 4, y: 40, size: 34}, dust: 14},
  {id: 's2', img: 'img/s2.png', start: 4.25, end: 11.05, tone: 'dark', zoomFrom: 1.06, zoomTo: 1.13, origin: '55% 30%', glow: {x: 22, y: 22, size: 40}, dust: 22},
  {id: 's3', img: 'img/s3.png', start: 11.05, end: 20.7, tone: 'dark', zoomFrom: 1.05, zoomTo: 1.14, origin: '50% 28%', glow: {x: 80, y: 10, size: 46}, dust: 16},
  {id: 's4', img: 'img/s4.png', start: 20.7, end: 33.0, tone: 'dark', zoomFrom: 1.04, zoomTo: 1.08, origin: '50% 30%', dust: 18},
  {id: 's5', img: 'img/s5.png', start: 33.0, end: 41.45, tone: 'dark', zoomFrom: 1.05, zoomTo: 1.11, origin: '50% 35%', dust: 12},
  {id: 's6', img: 'img/s6.png', start: 41.45, end: 47.8, tone: 'light', zoomFrom: 1.12, zoomTo: 1.04, origin: '45% 28%', glow: {x: 85, y: 18, size: 55}, dust: 40},
  {id: 's7', img: 'img/s7.png', start: 47.8, end: 51.55, tone: 'light', zoomFrom: 1.04, zoomTo: 1.12, origin: '72% 24%', glow: {x: 73, y: 28, size: 30}, dust: 20},
];

export const CTA = {start: 51.55, end: TOTAL_SECONDS};

export type Caption = {start: number; end: number; text: string; tone: Tone};

export const CAPTIONS: Caption[] = [
  {start: 0.2, end: 2.2, text: 'Có những buổi sáng,\nchưa kịp mở mắt…', tone: 'dark'},
  {start: 2.2, end: 4.25, text: 'Ngực đã nặng.', tone: 'dark'},
  {start: 4.4, end: 7.6, text: 'Ngủ đủ bảy tiếng.\nChưa có chuyện gì xảy ra.', tone: 'dark'},
  {start: 7.6, end: 10.95, text: 'Vậy mà cơ thể như đã ở\ngiữa một ngày dài.', tone: 'dark'},
  {start: 11.2, end: 13.4, text: 'Có thể bạn đã thử cố thêm.', tone: 'dark'},
  {start: 13.4, end: 16.0, text: 'Dậy sớm hơn.\nCà phê đậm hơn.', tone: 'dark'},
  {start: 16.0, end: 18.0, text: 'Thêm một app thói quen.', tone: 'dark'},
  {start: 18.0, end: 20.6, text: 'Sáng hôm sau,\nngực vẫn nặng.', tone: 'dark'},
  {start: 21.0, end: 23.1, text: 'Có một thứ bạn\nkhông nhìn thấy.', tone: 'dark'},
  {start: 23.1, end: 26.6, text: 'Ngay khi thức dậy, cortisol,\nhormone căng thẳng, dâng lên.', tone: 'dark'},
  {start: 26.6, end: 30.4, text: 'Đạt đỉnh sau 30–45 phút.', tone: 'dark'},
  {start: 30.4, end: 33.0, text: 'Bình thường, đó là\ncơ chế giúp ta tỉnh.', tone: 'dark'},
  {start: 33.3, end: 35.9, text: 'Khi cơ thể đã quen\ncăng thẳng kéo dài,', tone: 'dark'},
  {start: 35.9, end: 38.5, text: 'lệnh khởi động thành\nlệnh chiến đấu.', tone: 'dark'},
  {start: 38.5, end: 41.4, text: 'Mỗi sáng.\nTrước khi kịp chọn.', tone: 'dark'},
  {start: 41.7, end: 45.3, text: 'Đó không phải yếu đuối.\nĐó là một phản xạ đã học được.', tone: 'light'},
  {start: 45.3, end: 47.8, text: 'Cố thêm không chạm tới\nđược tầng đó.', tone: 'light'},
  {start: 48.0, end: 51.5, text: 'Mỗi người mắc kẹt\ntheo một kiểu.\nCó 5 kiểu.', tone: 'light'},
];

// Đường cong cortisol
export const CURVE_S4 = {drawStart: 23.4, peakAt: 27.6, drawEnd: 29.6, labelsAt: 23.3};
export const CURVE_S5 = {spikeStart: 35.9, spikeEnd: 37.7};
export const SOURCE_NOTE = {start: 23.3, end: 33.0, text: 'Fries và cộng sự, 2009'};
