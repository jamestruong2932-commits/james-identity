# Bàn giao: Ad2 (xong) và kế hoạch edit Ad1, Ad3

Ghi chú này dành cho phiên Claude mở trên máy khác. Đọc hết trước khi sửa gì.

Brief gốc của chiến dịch (kịch bản Ad1, Ad3, quy tắc chính sách Meta):
https://claude.ai/artifact/R2wDW6hWQTCkzeHMqMG4Sx (đọc bằng Artifact tool, action "read").
Lưu ý: kịch bản Ad2 trong brief là bản cũ. Bản đã duyệt nằm trong `src/timeline.ts` của dự án này.

---

## 1. Ad2 — trạng thái

- Video: "Ngực Đã Nặng Trước Khi Kịp Mở Mắt", ảnh minh hoạ chuyển động + giọng đọc AI, 57 giây, 1080×1920, 30fps.
- Đã duyệt: kịch bản, 7 ảnh, giọng đọc, đoạn quay màn hình diagnostic.html ở cảnh CTA.
- **Còn thiếu: nhạc nền.** Yêu cầu: piano/ambient không lời, không trống, 60–75 BPM, nguồn được phép chạy ads (Meta Sound Collection ưu tiên, sau đó Pixabay Music). Khi ghép:
  - nhạc nhỏ hơn giọng đọc khoảng 18–22 dB, ducking khi có giọng;
  - fade in đầu, nâng nhẹ ở giây 41,5 (cảnh chuyển từ tối sang sáng), fade out 2 giây cuối.

### Cấu trúc

```
video/
  src/timeline.ts   mọi mốc thời gian (giây), chữ trên màn hình, thông số cảnh — sửa ở đây
  src/Ad2.tsx       dựng hình: zoom, vệt sáng, bụi, vân giấy, đường cong cortisol, chữ, CTA
  public/img/s1–s7  ảnh đã xoá logo Gemini và phóng lên 1080×1936
  public/voice.wav  giọng đọc (55,24 giây, Google AI Studio TTS)
  public/rec.mp4    quay màn hình diagnostic.html, đã cắt bỏ thanh cuộn và nút AssistiveTouch
  out/              file render (không đưa lên git)
```

### Chạy

```bash
npm install
npm run studio                       # xem và chỉnh trong trình duyệt
npm run render                       # bản chính 1080p -> out/Ad2_Animated_Cortisol.mp4
npx remotion render src/index.ts Ad2 out/nhap.mp4 --scale=0.67 --concurrency=2   # bản nháp nhẹ cho máy yếu
```

File gửi qua Remote Control phải dưới 30 MB. Làm bản xem trước:
`ffmpeg -i in.mp4 -vf scale=720:-2 -c:v libx264 -crf 26 -c:a aac -b:a 128k out_720p.mp4`

### Cách đã làm (dùng lại cho video sau)

- Mốc thời gian lấy từ khoảng lặng của giọng đọc:
  `ffmpeg -i voice.wav -af silencedetect=noise=-35dB:d=0.45 -f null -`
- Xoá logo ngôi sao Gemini (ảnh 768×1376):
  `ffmpeg -i in.png -vf "delogo=x=620:y=1226:w=58:h=58,scale=1080:1936:flags=lanczos" out.png`
- Nút tròn AssistiveTouch trong video quay iPhone: delogo để lại vệt mờ, nên cắt bỏ hẳn vùng đó (`crop`).

---

## 2. Quy tắc phong cách (Luxury Zen)

- Màu: kem `#F4F1EA`, nâu đậm `#3E2723`, gold-sand `#B08D57`. Chữ kem `#F6EEDC` trên nền tối.
- Font: Playfair Display cho chữ chính, Inter cho chữ nhỏ (qua `@remotion/google-fonts`, subset vietnamese).
- Chữ đặt ở dải giữa dưới (khoảng 56–80% chiều cao), tránh 20% dưới cùng vì Reels đè caption và nút lên.
- Mỗi dòng chữ đứng ít nhất 2 giây. Tắt tiếng vẫn hiểu được. Phụ đề cứng là bắt buộc.
- Chuyển động chậm: zoom hoặc lia nhẹ, chuyển cảnh mờ dần. Không hiệu ứng bay nhảy, không logo mở đầu.

## 3. Quy tắc nội dung và chính sách Meta

- Không khẳng định người xem có vấn đề sức khoẻ (thể chất hay tinh thần). Không viết "bạn đang kiệt sức", "bạn thấy ngực nặng". Phần nói về cơ thể dùng "Có những buổi sáng…" hoặc bỏ chủ ngữ; "bạn" chỉ dùng cho hành động và CTA.
- Không dùng con số "50–75%" về cortisol (chưa kiểm được nguồn gốc). Mốc "30–45 phút" có nguồn: Fries và cộng sự, 2009.
- Không hứa kết quả. CTA: "Tìm hiểu thêm", trỏ về diagnostic.html. Cuối bài nhập email mới thấy kết quả (event Lead bắn ở bước này).
- Ad1 hook mở bằng "mình", không nói về người xem.

---

## 4. Kế hoạch edit Ad1 và Ad3 (founder quay điện thoại)

Kịch bản đầy đủ ở brief, mục 06a (Ad1) và 06b (Ad3).

- **Ad1:** founder bản ngắn khoảng 20 giây, góc "phá niềm tin cũ", hook "Mình muốn kỷ luật. Nhưng mình không làm được." Có hook B quay cùng buổi để thử nghiệm.
- **Ad3:** founder kể chuyện khoảng 87 giây.

Hai video quay cùng buổi, cùng bối cảnh. Video gốc chép thẳng từ điện thoại vào máy, **không đưa lên git** (quá nặng). Đặt ở `ads/ads 1/` và `ads/ads 3/`.

Các bước:
1. Kiểm tra video gốc: độ dài, khổ (phải 9:16), âm thanh.
2. Cắt khoảng lặng dài hơn 0,3 giây và các đoạn nói hỏng (dùng `silencedetect` như trên, rồi ghép các đoạn bằng ffmpeg hoặc Remotion).
3. Chuyển lời nói thành chữ có mốc thời gian để làm phụ đề. **Máy yếu thì dùng dịch vụ đám mây** (Gemini API hoặc Groq), không chạy WhisperX tại máy (cần 8 GB RAM trở lên). Đối chiếu với kịch bản trong brief và sửa chính tả.
4. Dựng bằng Remotion: video founder làm nền, phụ đề theo quy tắc ở mục 2, chữ hook lớn ở 3 giây đầu, cảnh CTA cuối dùng lại `public/rec.mp4` và bố cục CTA của Ad2.
5. Gửi bản xem trước 720p để duyệt, rồi render bản chính.
6. Tên file theo brief: `Ad1_Founder_KyLuat.mp4`, `Ad3_Founder_27Trieu.mp4`.
