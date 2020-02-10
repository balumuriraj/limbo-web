import React from 'react';
import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh, TextureLoader, MeshLambertMaterial, PlaneGeometry, Texture, VideoTexture, LinearFilter, RGBFormat, ShaderMaterial, Vector2, ClampToEdgeWrapping } from 'three';
import './App.css';
import 'tracking';
import data from './data/data.json';

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

class App extends React.Component {

  componentDidMount() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');    

    // Image 
    const img = new Image();
    // img.onload = drawImg;
    img.src = `${assetsPath}head.png`;

    // function drawImg() {
    //   canvas.width = img.naturalWidth;
    //   canvas.height = img.naturalHeight / 2;

    //   ctx.drawImage(img, 0, 0, img.width, img.height / 2, 0, 0, img.width, img.height / 2);
    // }

    // Video
    const video = document.createElement("video"); // create a video element
    video.src = `${assetsPath}shot1.mp4`;
    // video.loop = true;
    video.muted = true;
    video.preload = "auto";

    let frameIndex = 0;
    const fps = 25;
    let now;
    let then = Date.now();
    const interval = 1000 / fps;
    let delta;

    video.addEventListener("play", drawFrame, false);

    function drawFrame() {
      requestAnimationFrame(drawFrame);

      now = Date.now();
      delta = now - then;

      if (delta > interval) {
        frameIndex++;
        then = now - (delta % interval);

        // drawUsingCanvas();
        drawUsingWebGL();
      }
    }

    video.play();

    function drawFace(context: CanvasRenderingContext2D, index: number, width: number, height: number) {
      faceCanvas.width = width;
      faceCanvas.height = height;

      const frame = data[index];

      if (frame) {
        // Move registration point to the center of the canvas
        faceCtx.translate(frame.position[0], frame.position[1]);
        faceCtx.rotate(frame.rotation * Math.PI / 180);// angle must be in radians
        faceCtx.scale(frame.scale / 100, frame.scale / 100);
        // Move registration point back to the top left corner of canvas
        faceCtx.translate(-frame.position[0], -frame.position[1]);
        faceCtx.drawImage(img, frame.position[0] - 100, frame.position[1] - 300, 200, 300);


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
      }
    }

    function drawUsingCanvas() {
      if (!video.videoWidth) {
        return;
      }

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight / 2;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      tempCanvas.width = videoWidth;
      tempCanvas.height = videoHeight;

      if (video.paused || video.ended) {
        console.log("count: ", frameIndex);
        frameIndex = 0;
        video.play();
        return;
      }

      ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, videoWidth, videoHeight);
      tempCtx.drawImage(video, 0, videoHeight, videoWidth, videoHeight, 0, 0, videoWidth, videoHeight);

      drawFace(ctx, frameIndex, videoWidth, videoHeight);
    }

    //make your video canvas
    // const videocanvas = document.createElement('canvas');
    // const videocanvasctx = videocanvas.getContext('2d');

    const width = 1280;// 1024; // video.videoWidth;
    const height = 1440 / 2;// 512; // video.videoHeight / 2;
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
    camera.position.z = 5;

    // Scene
    const scene = new Scene();

    // renderer
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    document.getElementById("three").appendChild(renderer.domElement);

    // image
    //add canvas to new texture
    // const texture = new Texture(videocanvas);

    const texture = new VideoTexture(video);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.wrapS = ClampToEdgeWrapping;
    texture.wrapT = ClampToEdgeWrapping;
    // texture.format = RGBFormat;

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
uniform sampler2D webglTexture;

void main()
{
  vec2 uv = vUv;
  // float ratio = 1280.0 / 1440.0; //480./204.;
  // uv.y *= ratio;
  
  // uv.y -= (0.5 - (1. / ratio) * 0.5) * ratio;
  
  vec4 mask = texture2D(texture, uv - uvOffset);
  vec4 col1 = texture2D(webglTexture, uv);
  vec4 col2 = texture2D(texture, uv + uvOffset);

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
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

        const frame = data[frameIndex];

        if (frame) {
          // Move registration point to the center of the canvas
          tempCtx.translate(frame.position[0], frame.position[1]);
          tempCtx.rotate(frame.rotation * Math.PI / 180);// angle must be in radians
          tempCtx.scale(frame.scale / 100, frame.scale / 100);
          // Move registration point back to the top left corner of canvas
          tempCtx.translate(-frame.position[0], -frame.position[1]);
          tempCtx.drawImage(img, frame.position[0] - 100, frame.position[1] - 200, 200, 200);
        }

        webglcanvas.width = width;
        webglcanvas.height = height;
        webglCtx.drawImage(tempCanvas, 0, 0);

        //tell texture object it needs to be updated
        webglTexture.needsUpdate = true;
      }

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
