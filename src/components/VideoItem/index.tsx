import React from 'react';
import { loadAnimation } from "../../utils/canvasUtils"
import { drawCanvasFrames } from "../../utils/frameUtils"
import { createVideo, extractFramesFromVideo } from '../../utils/videoUtils';
import { createAudio } from '../../utils/audioUtils';
import Button from '@material-ui/core/Button';
import { AnimationItem } from 'lottie-web';
import Loading from '../Loading';
import "./styles.scss";

interface IProps {
  videoUrl: string;
  animationUrl: string;
  width: number;
  height: number;
}

interface IState {
  isProcessing: boolean;
  canvas: HTMLCanvasElement;
  videoFrames: ImageData[];
  lottieAnimation: AnimationItem;
  audioElement: HTMLAudioElement;
  audioStream: MediaStream;
  width: number;
  height: number;
}

const loadingProps: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0
}

// TODO:
// https://cf-api-prod-phoenix.jibjab.com/v1/template_groups/the-git-up-blanco-brown-starring-you-ecard
// https://www.jibjab.com/video_assets/d3cd5883-31c4-4987-ab9c-ea2b380a87f2/original/9c8f60ec-b758-44a0-99ee-837dcae55575-The_Git_Up_NG_w640x720.mp4
// https://cf-assets-prod-phoenix.jibjab.com/templates/the-git-up-blanco-brown-starring-you-ecard/original/566082e2-198f-45fe-98d6-9f3ee8b41425-position_data.txt
class VideoItem extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      isProcessing: false,
      canvas: null,
      videoFrames: null,
      lottieAnimation: null,
      audioElement: null,
      audioStream: null,
      width: 0,
      height: 0
    };
  }

  async componentDidMount() {
    if (!this.props.videoUrl) {
      return;
    }

    this.setState({ isProcessing: true });
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    if (canvas.getContext) {
      const video = createVideo(this.props.videoUrl);
      const videoFrames = await extractFramesFromVideo(video);
      const lottieAnimation = await loadAnimation(this.props.animationUrl);
      const width = video.videoWidth;
      const height = video.videoHeight;
      this.setState({ canvas, videoFrames, lottieAnimation, width, height });
    }

    this.setState({ isProcessing: false });
  }

  async playPreview() {
    this.setState({ isProcessing: true });
    // The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page. https://goo.gl/7K7WLu
    let audioElement = this.state.audioElement;
    let audioStream = this.state.audioStream;
    if (!audioElement || !audioStream) {
      const result = createAudio(this.props.videoUrl);
      audioElement = result.audioElement;
      audioStream = result.audioStream;
      this.setState({ audioElement, audioStream });
    }

    const { canvas, videoFrames, lottieAnimation, width, height } = this.state;
    await drawCanvasFrames(canvas, videoFrames, lottieAnimation, audioElement, width, height);
    this.setState({ isProcessing: false });
  }

  async download() {
    this.setState({ isProcessing: true });
    // The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page. https://goo.gl/7K7WLu
    let audioElement = this.state.audioElement;
    let audioStream = this.state.audioStream;
    if (!audioElement || !audioStream) {
      const result = createAudio(this.props.videoUrl);
      audioElement = result.audioElement;
      audioStream = result.audioStream;
      this.setState({ audioElement, audioStream });
    }

    const { canvas, videoFrames, lottieAnimation, width, height } = this.state;
    await drawCanvasFrames(canvas, videoFrames, lottieAnimation, audioElement, width, height, audioStream, true);
    this.setState({ isProcessing: false });
  }

  render() {
    return (
      <>
        <div id="lottie" style={{ width: this.props.width, height: this.props.height, visibility: "hidden", position: "absolute", left: -99999, bottom: -99999 }}></div>
        <div className="player-container">
          {this.state.isProcessing ? <Loading width={this.props.width} height={this.props.height} cssProps={loadingProps} /> : null}
          <canvas id="canvas" style={{
            width: this.props.width,
            height: this.props.height,
            backgroundColor: this.state.isProcessing ? "#eb4d4b" : "#111"
          }}></canvas>
        </div>
        <div>
          <Button color="primary" onClick={this.playPreview.bind(this)} disabled={this.state.isProcessing}>Play</Button>
          <Button color="secondary" onClick={this.download.bind(this)} disabled={this.state.isProcessing}>Download</Button>
        </div>
      </>
    );
  }
}

export default VideoItem;