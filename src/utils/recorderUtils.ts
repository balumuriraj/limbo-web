import { createVideo } from "./videoUtils";

const type = 'video/webm';

export function getMediaRecorder(canvas: HTMLCanvasElement, audioStream: MediaStream) {
  const stream: MediaStream = (canvas as any).captureStream();
  const audioTrack = audioStream.getAudioTracks()[0];
  stream.addTrack(audioTrack);

  // console.log('Started stream capture from canvas element: ', stream);
  
  return new MediaRecorder(stream, { mimeType: type });
}

export function playBlob(recordedBlobs: Blob[], container: HTMLElement) {
  const superBuffer = new Blob(recordedBlobs);
  const url = URL.createObjectURL(superBuffer);
  const video = createVideo(url);
  video.controls = true;
  container.appendChild(video);
}

export function downloadBlob(recordedBlobs: Blob[]) {
  // console.log("recordedBlobs.length: ", recordedBlobs.length);
  const blob = new Blob(recordedBlobs, { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'video.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}