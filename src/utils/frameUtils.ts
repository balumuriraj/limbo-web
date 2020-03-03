import { drawUsingCanvas } from "./canvasUtils";
import { AnimationItem } from "lottie-web";
import { initWebGL, drawUsingWebGL } from "./webglUtils";

const fps = 25;
const interval = 1000 / fps;
const tolerance = 0.1;

export async function drawCanvasFrames(
  outCanvas: HTMLCanvasElement,
  videoFrames: ImageData[],
  anim: AnimationItem,
  audio: HTMLAudioElement,
  audioContext: AudioContext,
  mediaRecorder: MediaRecorder,
  width: number,
  height: number
): Promise<Blob[]> {
  return new Promise((resolve) => {
    let frameIndex = -1;
    let now;
    let then = Date.now();
    let delta;
    let isPlaying = false;
    const recordedBlobs: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      resolve(recordedBlobs);
    };

    function drawFrame() {
      if (frameIndex >= videoFrames.length) {
        // TODO: Wait until all the frames are drawn
        mediaRecorder.stop();
        return;
      }

      requestAnimationFrame(drawFrame);      

      now = Date.now();
      delta = now - then;

      if (delta >= interval - tolerance) {
        frameIndex++;
        then = now - (delta % interval);

        anim.goToAndStop(frameIndex, true);
        drawUsingCanvas(outCanvas, videoFrames[frameIndex], (anim as any).container, width, height);

        if (!isPlaying) {
          isPlaying = true;
          mediaRecorder.start();
  
          if (audioContext && audioContext.state !== 'running') {
            audioContext.resume();
          } else {
            audio.play();
          }
        }
      }
    }

    drawFrame();
  });
}

export async function drawWebGLFrames(videoFrames: ImageData[], anim: AnimationItem, videoWidth: number, videoHeight: number) {
  initWebGL(videoWidth, videoHeight);

  let frameIndex = -1;
  let now;
  let then = Date.now();
  let delta;

  function drawFrame() {
    if (frameIndex >= videoFrames.length) {
      return;
    }

    requestAnimationFrame(drawFrame);

    now = Date.now();
    delta = now - then;

    if (delta >= interval - tolerance) {
      frameIndex++;
      then = now - (delta % interval);

      anim.goToAndStop(frameIndex, true);
      drawUsingWebGL(videoFrames[frameIndex], (anim as any).container, videoWidth, videoHeight);
    }
  }

  drawFrame();
}
