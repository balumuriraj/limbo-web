export function createAudio(videoPath: string) {
  const audioContext = new window.AudioContext();
  const audioElement = document.createElement("audio");
  audioElement.src = videoPath;

  // create a stream from our AudioContext
  const dest = audioContext.createMediaStreamDestination();
  const track = audioContext.createMediaElementSource(audioElement);
  // connect our video element's output to the stream
  track.connect(dest);
  // output to our headphones
  track.connect(audioContext.destination);

  return { audioElement, audioStream: dest.stream };
}