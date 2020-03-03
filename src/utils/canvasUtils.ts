import lottie, { AnimationItem } from 'lottie-web';

let tempCanvas = document.createElement("canvas");
let tempCtx = tempCanvas.getContext('2d');

export async function loadAnimation(path: string, container: HTMLElement): Promise<AnimationItem> {
  try {
    const response = await fetch(path);
    const data = await response.json();
    const paths = { file: "p", folder: "u", preserveAspectRatio: "pr" };

    data.assets.forEach((asset: any) => {
      asset[paths.folder] = "";
      asset[paths.file] = "https://firebasestorage.googleapis.com/v0/b/funwithlimbo.appspot.com/o/media%2Fimages%2Fhead.png?alt=media&token=bd840652-803c-4016-9e7b-ae730e90b5dc"; // Override image
      asset["e"] = 1;
    });

    return lottie.loadAnimation({
      container, // the dom element that will contain the animation
      renderer: 'canvas',
      loop: false,
      autoplay: false,
      animationData: data
    });
  } catch (err) {
    console.log(err);
  }
}

export function drawUsingCanvas(
  outCanvas: HTMLCanvasElement,
  frame: ImageData,
  animCanvas: HTMLCanvasElement,
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

    // console.log((anim as any).container);
    outCtx.globalCompositeOperation = "destination-over";
    outCtx.drawImage(animCanvas, 0, 0, width, height);
  }
}