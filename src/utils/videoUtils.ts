const fps = 25;

export function createVideo(videoPath: string) {
  const video = document.createElement("video"); // create a video element
  video.src = videoPath;
  video.preload = "auto";
  
  return video;
}

export async function extractFramesFromVideo(video: HTMLVideoElement): Promise<ImageData[]> {
  return new Promise(async (resolve) => {
    let seekResolve: any;
    
    video.addEventListener('seeked', async function () {
      if (seekResolve) seekResolve();
    });

    video.addEventListener("loadeddata", extractFrames, false);

    async function extractFrames() {
      let [w, h] = [video.videoWidth, video.videoHeight];
      let can = document.createElement('canvas');
      let c = can.getContext('2d');
      can.width = w;
      can.height = h;

      const canvasFrames = [];
      let interval = 1 / fps;
      let currentTime = interval;
      let duration = video.duration;

      while (currentTime < duration) {
        // console.count();
        // console.log(currentTime);
        video.currentTime = currentTime;
        await new Promise(r => seekResolve = r);
        c.drawImage(video, 0, 0);
        canvasFrames.push(c.getImageData(0, 0, w, h))

        // let base64ImageData = canvas.toDataURL();
        // frames.push(base64ImageData);

        /* 
        this will save as a Blob, less memory consumptive than toDataURL
        a polyfill can be found at
        https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob#Polyfill
        */
        // canvas.toBlob(() => frames.push, 'image/jpeg');

        currentTime += interval;
      }
      resolve(canvasFrames);
    }
  });
}