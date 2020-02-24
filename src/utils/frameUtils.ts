import { drawUsingCanvas } from "./canvasUtils";
import { AnimationItem } from "lottie-web";
import { initWebGL, drawUsingWebGL } from "./webglUtils";
import { getMediaRecorder } from "./recorderUtils";

const fps = 25;
const interval = 1000 / fps;
const tolerance = 0.1;

export async function drawCanvasFrames(
  outCanvas: HTMLCanvasElement,
  videoFrames: ImageData[],
  anim: AnimationItem,
  audio: HTMLAudioElement,
  width: number,
  height: number,
  audioStream?: MediaStream,
  isCapture?: boolean
) {
  let frameIndex = -1;
  let now;
  let then = Date.now();
  let delta;
  let mediaRecorder: MediaRecorder;
  let isPlaying = false;

  function drawFrame() {
    if (frameIndex >= videoFrames.length) {
      if (isCapture) {
        mediaRecorder.stop();
      }

      return;
    }

    requestAnimationFrame(drawFrame);

    if (isCapture) {
      if (!mediaRecorder) {
        mediaRecorder = getMediaRecorder(outCanvas, audioStream);
        mediaRecorder.start();
      }
    }

    if (!isPlaying) {
      isPlaying = true;
      audio.play();
    }

    now = Date.now();
    delta = now - then;

    if (delta >= interval - tolerance) {
      frameIndex++;
      then = now - (delta % interval);

      anim.goToAndStop(frameIndex, true);
      drawUsingCanvas(outCanvas, videoFrames[frameIndex], (anim as any).container, width, height);
    }
  }

  drawFrame();
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
