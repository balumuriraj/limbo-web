import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh, TextureLoader, MeshLambertMaterial, PlaneGeometry, Texture, VideoTexture, LinearFilter, RGBFormat, ShaderMaterial, Vector2, ClampToEdgeWrapping } from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';

let tempCanvas = document.createElement("canvas");
let tempCtx = tempCanvas.getContext('2d');

function drawWebGL(video: HTMLVideoElement) {
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

        // const frame = data.frames[frameIndex];

        // if (frame) {
        //   // Move registration point to the center of the canvas
        //   tempCtx.translate(frame.position[0], frame.position[1]);
        //   tempCtx.rotate(frame.rotation * Math.PI / 180);// angle must be in radians
        //   tempCtx.scale(frame.scale / 100, frame.scale / 100);
        //   // Move registration point back to the top left corner of canvas
        //   tempCtx.translate(-frame.position[0], -frame.position[1]);
        //   // tempCtx.drawImage(img, frame.position[0] - 100, frame.position[1] - 150, 200, 300);
        // }

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