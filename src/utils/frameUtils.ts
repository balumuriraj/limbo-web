import { extractFramesFromVideo } from "./videoUtils"
import { drawUsingCanvas } from "./canvasUtils";
import { AnimationItem } from "lottie-web";
import { initWebGL, drawUsingWebGL } from "./webglUtils";

const fps = 25;
const interval = 1000 / fps;
const tolerance = 0.1;

export async function drawCanvasFrames(outCanvas: HTMLCanvasElement, video: HTMLVideoElement, anim: AnimationItem) {
  const frames = await extractFramesFromVideo(video);

  let frameIndex = -1;
  let now;
  let then = Date.now();
  let delta;

  function drawFrame() {
    if (frameIndex >= frames.length) {
      frameIndex = 0; // to loop infinitely
      // return;
    }

    requestAnimationFrame(drawFrame);

    now = Date.now();
    delta = now - then;

    if (delta >= interval - tolerance) {
      frameIndex++;
      then = now - (delta % interval);

      anim.goToAndStop(frameIndex, true);
      drawUsingCanvas(outCanvas, frames[frameIndex], (anim as any).container, video.videoWidth, video.videoHeight);
      // drawUsingWebGL();
    }
  }

  drawFrame();
}

export async function drawWebGLFrames(video: HTMLVideoElement, anim: AnimationItem) {  
  const frames = await extractFramesFromVideo(video);
  initWebGL(video);

  let frameIndex = -1;
  let now;
  let then = Date.now();
  let delta;

  function drawFrame() {
    if (frameIndex >= frames.length) {
      frameIndex = 0; // to loop infinitely
      // return;
    }

    requestAnimationFrame(drawFrame);

    now = Date.now();
    delta = now - then;

    if (delta >= interval - tolerance) {
      frameIndex++;
      then = now - (delta % interval);

      anim.goToAndStop(frameIndex, true);
      drawUsingWebGL(frames[frameIndex], (anim as any).container, video.videoWidth, video.videoHeight);
    }
  }

  drawFrame();
}
