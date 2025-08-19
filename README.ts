// Get FFmpeg path without TypeScript interference
function getFFmpegPath(): string {
  try {
    const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg') as any;
    console.log('📹 Using @ffmpeg-installer/ffmpeg:', ffmpegInstaller.path);
    return ffmpegInstaller.path;
  } catch (error: any) {
    console.warn('⚠️  @ffmpeg-installer/ffmpeg not available:', error.message);
    console.log('📹 Using system FFmpeg');
    return 'ffmpeg';
  }
}

const ffmpegPath = getFFmpegPath();
