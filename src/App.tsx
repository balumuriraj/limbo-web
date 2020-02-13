import React from 'react';
import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh, TextureLoader, MeshLambertMaterial, PlaneGeometry, Texture, VideoTexture, LinearFilter, RGBFormat, ShaderMaterial, Vector2, ClampToEdgeWrapping } from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';
import './App.css';
import 'tracking';
import data from './data/final.json';

tracking.ColorTracker.registerColor('white', function (r, g, b) {
  if (r === 255 && g === 255 && b === 255) {
    return true;
  }
  return false;
});

const assetsPath = `${process.env.PUBLIC_URL}/assets/`;
const faceCanvas = document.createElement("canvas");
const faceCtx = faceCanvas.getContext('2d');
let tempCanvas = document.createElement("canvas");
let tempCtx = tempCanvas.getContext('2d');

// TODO:
// https://cf-api-prod-phoenix.jibjab.com/v1/template_groups/the-git-up-blanco-brown-starring-you-ecard
// https://www.jibjab.com/video_assets/d3cd5883-31c4-4987-ab9c-ea2b380a87f2/original/9c8f60ec-b758-44a0-99ee-837dcae55575-The_Git_Up_NG_w640x720.mp4
// https://cf-assets-prod-phoenix.jibjab.com/templates/the-git-up-blanco-brown-starring-you-ecard/original/566082e2-198f-45fe-98d6-9f3ee8b41425-position_data.txt
class App extends React.Component {

  async componentDidMount() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    const imgCanvas = document.createElement("canvas");
    const imgCtx = imgCanvas.getContext('2d');

    // Image 
    const img = new Image();
    img.onload = drawImg;
    img.src = `${assetsPath}head.png`;

    function drawImg() {
      imgCanvas.width = 512;
      imgCanvas.height = 256;

      const width = (img.naturalWidth / img.naturalHeight) * imgCanvas.height;
      imgCtx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, imgCanvas.width / 2 - width / 2, 0, width, imgCanvas.height);
    }

    // Video
    const video = document.createElement("video"); // create a video element
    video.src = `${assetsPath}final.mp4`;
    // video.loop = true;
    video.muted = true;
    video.preload = "auto";

    let frameIndex = -1;
    const fps = 25;
    let now;
    let then = Date.now();
    const interval = 1000 / fps;
    const tolerance = 0.1;
    let delta;

    // video.addEventListener("play", drawFrame, false);

    // function drawFrame() {
    //   console.log("playing");
    //   if (video.paused || video.ended) {
    //     return;
    //   }

    //   requestAnimationFrame(drawFrame);

    //   now = Date.now();
    //   delta = now - then;

    //   if (delta >= interval - tolerance) {
    //     frameIndex++;
    //     then = now - (delta % interval);

    //     // drawUsingCanvas();
    //     // drawUsingWebGL();
    //   }
    // }

    const frames = await extractFramesFromVideo();
    console.log(frames.length);

    async function extractFramesFromVideo(): Promise<ImageData[]> {
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

          let frames: any[] = [];
          let interval = 1 / fps;
          let currentTime = 0;
          let duration = video.duration;

          while (currentTime < duration) {
            // console.count();
            // console.log(currentTime);
            video.currentTime = currentTime;

            await new Promise(r => seekResolve = r);

            c.drawImage(video, 0, 0);

            frames.push(c.getImageData(0, 0, w, h))

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
          resolve(frames);
        }
      });
    }

    function drawFrame() {
      if (frameIndex >= frames.length) {
        return;
      }

      requestAnimationFrame(drawFrame);

      now = Date.now();
      delta = now - then;

      if (delta >= interval - tolerance) {
        frameIndex++;
        then = now - (delta % interval);
        console.log("drawing: ", frameIndex);
        drawUsingCanvas(frames[frameIndex], frameIndex);
        // drawUsingWebGL();
      }
    }

    drawFrame();

    // setTimeout(() => video.play(), 1000);
    // video.play();

    function drawFace(context: CanvasRenderingContext2D, index: number, width: number, height: number) {
      const nCanvas = document.createElement("canvas");
      const nCtx = nCanvas.getContext('2d');
      nCanvas.width = width;
      nCanvas.height = height;
      nCtx.putImageData(context.getImageData(0, 0, width, height), 0, 0, 0, 0, width, height);

      faceCanvas.width = width;
      faceCanvas.height = height;

      const frame = data.frames[index];
      const scale = data.scale;
      const rotation = data.rotation;
      const position = data.position;

      if (frame) {
        // Move registration point to the center of the canvas
        faceCtx.translate(width / 2, height / 2);
        
        // Move the image to correct position
        faceCtx.transform(
          scale / 100,
          rotation * Math.PI / 180,
          -rotation * Math.PI / 180,
          scale / 100,
          position[0] - width / 2, position[1] - height / 2
        );

        // Move the context to center of new rect
        faceCtx.translate(-position[0], -position[1]);

        // Move to tracking position
        faceCtx.transform(
          frame.scale / 100,
          (frame.rotation * Math.PI / 180),
          -(frame.rotation * Math.PI / 180),
          frame.scale / 100,
          frame.position[0],
          frame.position[1]
        );

        // Move registration point back to the top left corner of canvas
        faceCtx.translate(-width / 2, -height / 2);
        
        faceCtx.drawImage(imgCanvas, 0, 0);

        const imageData = faceCtx.getImageData(0, 0, canvas.width, canvas.height);
        const dat = imageData.data;
        const tempImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const tempData = tempImageData.data;

        for (var i = 0; i < dat.length; i += 4) {
          if (tempData[i] !== 255) {
            dat[i] = dat[i + 1] = dat[i + 2] = dat[i + 3] = 0;
          }
        }

        faceCtx.putImageData(imageData, 0, 0, 0, 0, width, height);
        context.drawImage(faceCanvas, 0, 0);

        // nCtx.drawImage(faceCanvas, 0, 0);
        // document.body.appendChild(nCanvas);
      }
    }

    function drawUsingCanvas(frame: ImageData, index: number) {
      // if (!video.videoWidth) {
      //   return;
      // }

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight / 2;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      tempCanvas.width = videoWidth;
      tempCanvas.height = videoHeight;

      // if (video.paused || video.ended) {
      //   // console.log("count: ", frameIndex);
      //   // frameIndex = 0;
      //   // video.play();
      //   return;
      // }

      // ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, videoWidth, videoHeight);
      // tempCtx.drawImage(video, 0, videoHeight, videoWidth, videoHeight, 0, 0, videoWidth, videoHeight);
      // drawFace(ctx, frameIndex, videoWidth, videoHeight);

      if (frame) {
        ctx.putImageData(frame, 0, 0, 0, 0, videoWidth, videoHeight);

        //TODO: fix me
        let can = document.createElement('canvas');
        let c = can.getContext('2d');
        can.width = 512;
        can.height = 512;
        c.putImageData(frame, 0, 0);
        tempCtx.drawImage(can, 0, videoHeight, videoWidth, videoHeight, 0, 0, videoWidth, videoHeight);

        // document.body.appendChild(tempCanvas);
        
        drawFace(ctx, index, videoWidth, videoHeight);        
      }
    }

    //make your video canvas
    // const videocanvas = document.createElement('canvas');
    // const videocanvasctx = videocanvas.getContext('2d');

    const width = 512;// 1024; // video.videoWidth;
    const height = 512 / 2;// 512; // video.videoHeight / 2;
    // videocanvas.width = width;
    // videocanvas.height = height;

    //draw a black rectangle so that your spheres don't start out transparent
    // videocanvasctx.fillStyle = "#000000";
    // videocanvasctx.fillRect(0, 0, width, height);

    // Camera
    // Specify the portion of the scene visiable at any time (in degrees)
    const fieldOfView = 75;

    // Specify the camera's aspect ratio
    const aspectRatio = width / height;

    // Specify the near and far clipping planes. Only objects
    // between those planes will be rendered in the scene
    // (these values help control the number of items rendered
    // at any given time)
    const nearPlane = 0.1;
    const farPlane = 1000;
    const camera = new PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
    camera.position.z = 12;

    // Scene
    const scene = new Scene();

    // renderer
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    document.getElementById("three").appendChild(renderer.domElement);

    // const controls = new OrbitControls( camera, renderer.domElement );
    // controls.update();

    // image
    //add canvas to new texture
    // const texture = new Texture(videocanvas);

    // const texture = new VideoTexture(video);
    const videoCanvas = document.createElement("canvas");
    const videoCtx = videoCanvas.getContext('2d');
    const texture = new Texture(videoCanvas);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.wrapS = ClampToEdgeWrapping;
    texture.wrapT = ClampToEdgeWrapping;
    // texture.format = RGBFormat;

    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext('2d');
    const maskTexture = new Texture(maskCanvas);
    maskTexture.minFilter = LinearFilter;
    maskTexture.magFilter = LinearFilter;
    maskTexture.wrapS = ClampToEdgeWrapping;
    maskTexture.wrapT = ClampToEdgeWrapping;

    // remove: for debugging
    const webglcanvas = document.getElementById('canvas') as HTMLCanvasElement; //document.createElement('canvas');
    const webglCtx = webglcanvas.getContext('2d');
    const webglTexture = new Texture(webglcanvas);
    webglTexture.minFilter = LinearFilter;
    webglTexture.magFilter = LinearFilter;
    webglTexture.wrapS = ClampToEdgeWrapping;
    webglTexture.wrapT = ClampToEdgeWrapping;

    // Load an image file into a custom material
    const vshader = `
varying vec2 vUv;

void main() {
  vUv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`
    const fshader = `
varying vec2 vUv;
uniform vec2 uvOffset;
uniform sampler2D texture;
uniform sampler2D maskTexture;
uniform sampler2D webglTexture;

void main()
{
  vec2 uv = vUv;
  // float ratio = 1280.0 / 1440.0; //480./204.;
  // uv.y *= ratio;
  
  // uv.y -= (0.5 - (1. / ratio) * 0.5) * ratio;
  
  vec4 mask = texture2D(maskTexture, uv);
  vec4 col1 = texture2D(webglTexture, uv);
  vec4 col2 = texture2D(texture, uv);

  gl_FragColor = step( 0.5, mask.r ) * col1 + ( 1.0 - step( 0.5, mask.r ) ) * col2;

  // vec3 col = col1.rgb * col1.a + col2.rgb * col2.a * (1.0 - col1.a);
  
  // col = mix(col, vec3(0), step(0.5, abs(uv.y - 0.5)));
  
  // gl_FragColor = vec4(col, 1.);
}
`
    // const material = new MeshBasicMaterial({ map: texture });
    const uniforms = {
      texture: { value: texture },
      webglTexture: { value: webglTexture },
      maskTexture: { value: maskTexture },
      uvOffset: { value: new Vector2(0, 0.25) }
    };
    const material = new ShaderMaterial({
      uniforms,
      vertexShader: vshader,
      fragmentShader: fshader
    });
    const geometry = new PlaneGeometry(16, 17 * 0.9);
    const mesh = new Mesh(geometry, material);
    // set the position of the image mesh in the x,y,z dimensions
    mesh.position.set(0, 0, 0);
    scene.add(mesh);

    function drawUsingWebGL() {
      if (video.paused || video.ended) {
        // console.log("count: ", frameIndex);
        // frameIndex = 0;
        // video.play();
        return;
      }

      //check for vid data
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight / 2;
        videoCanvas.width = videoWidth;
        videoCanvas.height = videoHeight;
        videoCtx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, videoWidth, videoHeight);

        maskCanvas.width = videoWidth;
        maskCanvas.height = videoHeight;
        maskCtx.drawImage(video, 0, videoHeight, videoWidth, videoHeight, 0, 0, videoWidth, videoHeight);

        tempCanvas.width = videoWidth;
        tempCanvas.height = videoHeight;
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

        const frame = data.frames[frameIndex];

        if (frame) {
          // Move registration point to the center of the canvas
          tempCtx.translate(frame.position[0], frame.position[1]);
          tempCtx.rotate(frame.rotation * Math.PI / 180);// angle must be in radians
          tempCtx.scale(frame.scale / 100, frame.scale / 100);
          // Move registration point back to the top left corner of canvas
          tempCtx.translate(-frame.position[0], -frame.position[1]);
          tempCtx.drawImage(img, frame.position[0] - 100, frame.position[1] - 150, 200, 300);
        }

        webglcanvas.width = videoWidth;
        webglcanvas.height = videoHeight;
        webglCtx.drawImage(tempCanvas, 0, 0);

        //tell texture object it needs to be updated
        texture.needsUpdate = true;
        maskTexture.needsUpdate = true;
        webglTexture.needsUpdate = true;
      }

      // controls.update();
      renderer.render(scene, camera);
    }
  }

  render() {
    return (
      <div className="App">
        <p>WebGL implementation: </p>
        <div id="three"></div>
        <div>
          <p>Canvas implementation: </p>
          <canvas id="canvas"></canvas>
        </div>
        <div>
          {/* <video src={`${assetsPath}shot1.mp4`} preload="auto" autoPlay controls loop muted></video> */}
        </div>
      </div>
    );
  }
}

export default App;
