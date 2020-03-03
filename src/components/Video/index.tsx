import React, { useState, useEffect } from 'react';
import { loadAnimation } from "../../utils/canvasUtils"
import { drawCanvasFrames } from "../../utils/frameUtils"
import { createVideo, extractFramesFromVideo } from '../../utils/videoUtils';
import { createAudio } from '../../utils/audioUtils';
import { getMediaRecorder, playBlob, downloadBlob } from "../../utils/recorderUtils";
import Button from '@material-ui/core/Button';
import Loading from '../Loading';
import "./styles.scss";

interface IProps {
  videoUrl: string;
  animationUrl: string;
  width: number;
  height: number;
}

const hiddenCSSProps: React.CSSProperties = {
  visibility: "hidden",
  position: "absolute",
  left: -99999,
  bottom: -99999
}

// TODO:
// https://cf-api-prod-phoenix.jibjab.com/v1/template_groups/the-git-up-blanco-brown-starring-you-ecard
// https://www.jibjab.com/video_assets/d3cd5883-31c4-4987-ab9c-ea2b380a87f2/original/9c8f60ec-b758-44a0-99ee-837dcae55575-The_Git_Up_NG_w640x720.mp4
// https://cf-assets-prod-phoenix.jibjab.com/templates/the-git-up-blanco-brown-starring-you-ecard/original/566082e2-198f-45fe-98d6-9f3ee8b41425-position_data.txt
function Video({ videoUrl, animationUrl, width, height }: IProps) {
  const [isProcessing, setProcessing] = useState(false);
  const [blobs, setBlobs] = useState<Blob[]>();  

  useEffect(() => {
    if (!videoUrl) {
      return;
    }

    setProcessing(true);

    const process = async () => {
      const canvas = document.getElementById('framesContainer') as HTMLCanvasElement;
  
      if (canvas.getContext && window.AudioContext && (canvas as any).captureStream) {
        const video = createVideo(videoUrl);
        const videoFrames = await extractFramesFromVideo(video);
        const lottieAnimation = await loadAnimation(animationUrl, document.getElementById('animationContainer'));
        const { audioElement, audioStream, audioContext } = createAudio(videoUrl);
        const mediaRecorder = getMediaRecorder(canvas, audioStream);
        const recordedBlobs = await drawCanvasFrames(canvas, videoFrames, lottieAnimation, audioElement, audioContext, mediaRecorder, video.videoWidth, video.videoHeight);
  
        playBlob(recordedBlobs, document.getElementById("container"));
        setBlobs(recordedBlobs);
        setProcessing(false);
      }
    }

    process();    
  }, [videoUrl, animationUrl]);

  const download = () => {
    if (blobs) {
      downloadBlob(blobs);
    }
  }

  return (
    <>
      <div id="animationContainer" style={{ width, height, ...hiddenCSSProps }}></div>
      <canvas id="framesContainer" style={{ width, height, ...hiddenCSSProps }}></canvas>

      <div className="player-container" id="container">
        {isProcessing ? <Loading width={width} height={height} /> : null}
      </div>

      <div>
        <Button color="secondary" onClick={download} disabled={isProcessing}>Download</Button>
      </div>
    </>
  );
}

export default Video;