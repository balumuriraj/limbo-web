import React from 'react';
import { loadAnimation } from "../../utils/canvasUtils"
import { drawCanvasFrames } from "../../utils/frameUtils"
import { createVideo, extractFramesFromVideo } from '../../utils/videoUtils';
import { createAudio } from '../../utils/audioUtils';
import Button from '@material-ui/core/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { AnimationItem } from 'lottie-web';

interface IProps {
  videoUrl: string;
  animationUrl: string;
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
    const video = createVideo(this.props.videoUrl);
    const videoFrames = await extractFramesFromVideo(video);
    const lottieAnimation = await loadAnimation(this.props.animationUrl);
    const width = video.videoWidth;
    const height = video.videoHeight;
    this.setState({ isProcessing: false, canvas, videoFrames, lottieAnimation, width, height });
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
      <div>
        <div id="lottie" style={{ width: 512, height: 256, visibility: "hidden", position: "absolute", left: -99999, bottom: -99999 }}></div>
        <div>
          <canvas id="canvas"></canvas>
        </div>
        <div>
          <Button variant="contained" color="primary" onClick={this.playPreview.bind(this)}>Play</Button>
          <Button variant="contained" color="secondary" onClick={this.download.bind(this)}>Download</Button>
          {this.state.isProcessing ? <FontAwesomeIcon icon={faSpinner} spin /> : null}
        </div>
      </div>
    );
  }
}

export default VideoItem;