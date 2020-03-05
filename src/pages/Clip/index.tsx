import React, { useState, useEffect } from 'react';
import Loading from "../../components/Loading"
import { useParams, Link } from 'react-router-dom';
import { getClip } from '../../api/firestore/clips';
import "./styles.scss";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faVolumeUp, faExpand, faPause } from '@fortawesome/free-solid-svg-icons'

function Clip() {
  let { id } = useParams();
  const [clip, setClip] = useState({
    title: null,
    videoUrl: null,
    animationUrl: null,
    frames: 0,
    fps: 0,
    keywords: [],
    thumbnailUrl: null,
    thumb: null,
    width: 0,
    height: 0
  });
  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setLoading(true);

    const fetchData = async () => {
      if (id) {
        const result = await getClip(id);
        setClip(result);
      }

      setLoading(false);
      setVideo(document.getElementById("clip") as HTMLVideoElement);
    }

    fetchData();
  }, [id]);

  const togglePlay = () => {
    if (video) {
      if (!!(video && video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2)) {
        setPlaying(false);
        video.pause();
      } else {
        setPlaying(true);
        video.play();
      }
    }
  }

  const fullScreen = () => {
    video.requestFullscreen();
  }

  return (
    <div className="container">
      <div className="block">
        {/* <VideoItem videoUrl={clip.videoUrl} animationUrl={clip.animationUrl} width={clip.width} height={clip.height} /> */}
        {
          loading ?
            <Loading width={clip.height} height={clip.height} /> :
            <div>
              <div style={{ width: clip.width, height: clip.height, overflow: "hidden" }}>
                <video src={clip.videoUrl} id="clip" />
              </div>
              <div className="player-contols">
                <div><FontAwesomeIcon icon={playing ? faPause : faPlay} className="btn" onClick={togglePlay} /></div>
                <div>
                  <FontAwesomeIcon icon={faVolumeUp} className="btn" />
                  <FontAwesomeIcon icon={faExpand} className="btn" onClick={fullScreen} />
                </div>
              </div>
            </div>
        }
        <div className="info-container">
          <div className="info-block">
            <p className="title">{clip.title}</p>
            <p>keywords: {clip.keywords.join(", ")}</p>
          </div>
          <div className="info-block">
            <Link className="button" to={`/clip/create/${id}`}>Create Video</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Clip;