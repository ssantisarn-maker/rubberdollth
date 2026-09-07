/**
 * Helper to parse various video URLs (YouTube, Shorts, Vimeo, Google Drive, Direct MP4/WebM)
 * and return suitable embed metadata.
 */
export function getVideoEmbedInfo(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();

  // YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID
  const ytShorts = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i);
  if (ytShorts) {
    return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${ytShorts[1]}?autoplay=1&rel=0` };
  }

  // YouTube youtu.be: https://youtu.be/VIDEO_ID
  const youtuBe = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/i);
  if (youtuBe) {
    return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${youtuBe[1]}?autoplay=1&rel=0` };
  }

  // YouTube watch: https://www.youtube.com/watch?v=VIDEO_ID
  const ytWatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/i);
  if (ytWatch) {
    return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${ytWatch[1]}?autoplay=1&rel=0` };
  }

  // YouTube embed: https://www.youtube.com/embed/VIDEO_ID
  const ytEmbed = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i);
  if (ytEmbed) {
    return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${ytEmbed[1]}?autoplay=1&rel=0` };
  }

  // Google Drive: https://drive.google.com/file/d/FILE_ID/view...
  const gDrive = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gDrive) {
    return { type: 'iframe', src: `https://drive.google.com/file/d/${gDrive[1]}/preview` };
  }

  // Vimeo: https://vimeo.com/VIDEO_ID
  const vimeo = url.match(/vimeo\.com\/(\d+)/i);
  if (vimeo) {
    return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1` };
  }

  // Direct MP4 / WebM / Cloud file URL
  return { type: 'direct', src: url };
}
