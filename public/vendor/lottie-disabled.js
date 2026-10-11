// This beta deliberately excludes Lottie material animations and external loaders.
export class LottieLoader {
  load() { throw new Error('Lottie textures are not supported. Export PNG/JPEG/WebP textures.'); }
}
