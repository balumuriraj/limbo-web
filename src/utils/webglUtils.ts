import { Scene, PerspectiveCamera, WebGLRenderer, Mesh, PlaneGeometry, Texture, LinearFilter, ShaderMaterial, Vector2, ClampToEdgeWrapping } from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';
import { AnimationItem } from 'lottie-web';

// let tempCanvas = document.createElement("canvas");
// let tempCtx = tempCanvas.getContext('2d');

let renderer: WebGLRenderer = null;
let texture: Texture = null;
let maskTexture: Texture = null;
let animTexture: Texture = null;
let scene: Scene = null;
let camera: PerspectiveCamera = null;
let videoCanvas: HTMLCanvasElement = null;
let maskCanvas: HTMLCanvasElement = null;
let animCanvas: HTMLCanvasElement = null;
let controls: OrbitControls = null;

export function initWebGL(videoWidth: number, videoHeight: number) {
  // make your video canvas
  // const videocanvas = document.createElement('canvas');
  // const videocanvasctx = videocanvas.getContext('2d');

  const width = videoWidth;
  const height = videoHeight / 2;
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
  const nearPlane = 1;
  const farPlane = 10000;
  camera = new PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
  camera.position.z = 10;

  // Scene
  scene = new Scene();

  // renderer
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  document.getElementById("three").appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  // image
  // add canvas to new texture
  // const texture = new Texture(videocanvas);

  // const texture = new VideoTexture(video);
  videoCanvas = document.createElement("canvas");
  texture = new Texture(videoCanvas);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  // texture.format = RGBFormat;

  maskCanvas = document.createElement("canvas");
  maskTexture = new Texture(maskCanvas);
  maskTexture.minFilter = LinearFilter;
  maskTexture.magFilter = LinearFilter;
  maskTexture.wrapS = ClampToEdgeWrapping;
  maskTexture.wrapT = ClampToEdgeWrapping;

  animCanvas = document.createElement("canvas");
  animTexture = new Texture(animCanvas);
  animTexture.minFilter = LinearFilter;
  animTexture.magFilter = LinearFilter;
  animTexture.wrapS = ClampToEdgeWrapping;
  animTexture.wrapT = ClampToEdgeWrapping;

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
uniform sampler2D texture;
uniform sampler2D animTexture;
uniform sampler2D maskTexture;

void main()
{
  vec2 uv = vUv;
  vec4 anim = texture2D(animTexture, uv);
  vec4 video = texture2D(texture, uv);
  vec4 mask = texture2D(maskTexture, uv);

  gl_FragColor = step( 0.5, mask.r ) * anim + ( 1.0 - step( 0.5, mask.r ) ) * video;
}
`
  // const material = new MeshBasicMaterial({ map: texture });
  const uniforms = {
    texture: { value: texture },
    maskTexture: { value: maskTexture },
    animTexture: { value: animTexture }
  };
  const material = new ShaderMaterial({
    uniforms,
    vertexShader: vshader,
    fragmentShader: fshader
  });
  const geometry = new PlaneGeometry(1, 1);
  const mesh = new Mesh(geometry, material);
  // set the position of the image mesh in the x,y,z dimensions
  mesh.position.set(0, 0, 0);
  mesh.scale.set(width, height, 1);
  scene.add(mesh);

  // fit camera to mesh
  const dist = camera.position.z - mesh.position.z;
  camera.fov = 2 * Math.atan(height / (2 * dist)) * (180 / Math.PI);
  camera.updateProjectionMatrix();
}

export function drawUsingWebGL(
  frame: ImageData,
  animationCanvas: HTMLCanvasElement,
  videoWidth: number,
  videoHeight: number
) {
  const width = videoWidth;
  const height = videoHeight / 2;

  if (frame) {
    videoCanvas.width = width;
    videoCanvas.height = height;
    const videoCtx = videoCanvas.getContext('2d');
    //TODO: fix me
    let can = document.createElement('canvas');
    let c = can.getContext('2d');
    can.width = videoWidth;
    can.height = videoHeight;
    c.putImageData(frame, 0, 0);
    videoCtx.drawImage(can, 0, 0, width, height, 0, 0, width, height);

    maskCanvas.width = width;
    maskCanvas.height = height;
    //TODO: fix me
    const maskCtx = maskCanvas.getContext('2d');
    let can1 = document.createElement('canvas');
    let c1 = can1.getContext('2d');
    can1.width = videoWidth;
    can1.height = videoHeight;
    c1.putImageData(frame, 0, 0);
    maskCtx.drawImage(can1, 0, height, width, height, 0, 0, width, height);


    animCanvas.width = width;
    animCanvas.height = height;
    const animCtx = animCanvas.getContext('2d');
    animCtx.drawImage(animationCanvas, 0, 0, width, height);

    //tell texture object it needs to be updated
    texture.needsUpdate = true;
    maskTexture.needsUpdate = true;
    animTexture.needsUpdate = true;
  }

  controls.update();
  renderer.render(scene, camera);
}
