const type = 'video/webm';

export function getMediaRecorder(canvas: HTMLCanvasElement, audioStream: MediaStream) {
  // TODO: browser check
  const stream: MediaStream = (canvas as any).captureStream();
  const audioTrack = audioStream.getAudioTracks()[0];
  stream.addTrack(audioTrack);

  console.log('Started stream capture from canvas element: ', stream);
  
  const mediaRecorder = new MediaRecorder(stream, { mimeType: type });
  const recordedBlobs: Blob[] = [];

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    downloadBlob(recordedBlobs);
  };

  return mediaRecorder;
}

export function downloadBlob(recordedBlobs: Blob[]) {
  console.log("recordedBlobs.length: ", recordedBlobs.length);
  const blob = new Blob(recordedBlobs, { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}