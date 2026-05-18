# codex

3D scroll demo with video scrubbing/parallax.

## Video specs for smooth scroll-driven scrubbing

When mapping scroll position to `video.currentTime`, smoothness depends more on **encoding structure** than just file size.

### Recommended source/video settings

- **Codec/container:** MP4 (`.mp4`) with H.264 High/Main profile for broad browser support.
- **Resolution:** 1080p max for desktop demos, 720p for safer mid-range devices.
- **Frame rate:** constant 30fps (or 24fps cinematic). Avoid variable FPS for deterministic seeking.
- **GOP / keyframe interval:** short keyframe distance, ideally every **0.5 to 1 second** (`-g 15` to `-g 30` at 30fps).
  - Shorter GOP improves random access when `currentTime` is scrubbed.
- **Bitrate target:** enough to avoid compression artifacts but not excessive decode cost (rough guide: 4–8 Mbps for 1080p H.264).
- **No audio track** for background demos (`-an`) to reduce payload/decode overhead.
- **Fast start MP4:** move moov atom to file start (`-movflags +faststart`) for faster seek/read startup.

### Why these specs matter

- Scroll scrubbing triggers frequent seeks via `currentTime`. Long GOPs require decoding from an older keyframe to the target frame, which increases stutter.
- Constant FPS + tighter GOP yields more consistent frame stepping under ScrollTrigger scrub.
- Smaller decode complexity (reasonable resolution/bitrate, no audio) helps maintain responsiveness during scroll + layout/paint work.

### Example FFmpeg encode

```bash
ffmpeg -i input.mov \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -r 30 -g 30 -keyint_min 30 -sc_threshold 0 \
  -b:v 6M -maxrate 8M -bufsize 12M \
  -movflags +faststart -an output-scroll.mp4
```

### Optional extra for very smooth feel

- Export a second, lower-resolution asset for mobile and switch by media query/device class.
- Keep scroll snapping relaxed (`proximity`) so snap physics do not fight scrub interpolation.

## GitHub Pages video troubleshooting

If the video works locally but not on GitHub Pages:

- Verify the file exists on the **published branch** (`main` or `gh-pages`) at the exact path used in HTML (`./dubai-marina-scrub.mp4`).
- Check filename case exactly (`Dubai-Marina-Scrub.mp4` and `dubai-marina-scrub.mp4` are different on Pages).
- Avoid Git LFS-only pointers for Pages-hosted assets; ensure the real binary is present in the published branch.
- Keep MP4 MIME-compatible source tags and provide a fallback source.
