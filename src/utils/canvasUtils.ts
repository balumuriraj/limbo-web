import lottie, { AnimationItem } from 'lottie-web';

let tempCanvas = document.createElement("canvas");
let tempCtx = tempCanvas.getContext('2d');

export function loadAnimation(path: string): AnimationItem {
  const container = document.getElementById('lottie') as HTMLCanvasElement || document.createElement("div");
  // const container = document.createElement("div");
  // container.style.width = "512px";
  // container.style.height = "256px";

  return lottie.loadAnimation({
    container, // the dom element that will contain the animation
    renderer: 'canvas',
    loop: false,
    autoplay: false,
    path // the path to the animation json
  });
}

export function drawUsingCanvas(
  outCanvas: HTMLCanvasElement, 
  anim: AnimationItem, 
  frame: ImageData, 
  frameNumber: number,
  videoWidth: number,
  videoHeight: number
) {
  const width = videoWidth;
  const height = videoHeight / 2;
  outCanvas.width = width;
  outCanvas.height = height;
  tempCanvas.width = width;
  tempCanvas.height = height;

  if (frame) {
    //TODO: fix me
    let tempCan = document.createElement('canvas');
    let tempC = tempCan.getContext('2d');
    tempCan.width = videoWidth;
    tempCan.height = videoHeight;
    tempC.putImageData(frame, 0, 0);
    tempCtx.drawImage(tempCan, 0, height, width, height, 0, 0, width, height);

    // Converting matte image into alpha channel
    const tempImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const tempData32 = new Uint32Array(tempImageData.data.buffer);
    let j = 0;
    const len = tempData32.length;
    while (j < len) {
      tempData32[j] = tempData32[j++] << 8;
    }
    const outCtx = outCanvas.getContext('2d');
    outCtx.putImageData(tempImageData, 0, 0);
    outCtx.globalCompositeOperation = "source-out";

    //TODO: fix me
    let can = document.createElement('canvas');
    let c = can.getContext('2d');
    can.width = videoWidth;
    can.height = videoHeight;
    c.putImageData(frame, 0, 0);
    outCtx.drawImage(can, 0, 0, width, height, 0, 0, width, height);

    anim.goToAndStop(frameNumber, true);
    // console.log((anim as any).container);
    outCtx.globalCompositeOperation = "destination-over";
    outCtx.drawImage((anim as any).container, 0, 0, width, height);
  }
}