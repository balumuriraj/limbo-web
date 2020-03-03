import React, { useState, useEffect } from 'react';
import Video from "../../../components/Video";
import Loading from "../../../components/Loading"
import { useParams } from 'react-router-dom';
import { getClip } from '../../../api/clips';
import "./styles.scss";

function Create() {
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

  useEffect(() => {
    setLoading(true);

    const fetchData = async () => {
      if (id) {
        const result = await getClip(id);
        setClip(result);
      }

      setLoading(false);
    }

    fetchData();
  }, [id]);

  return (
    <div className="container">
      <div className="block">
        {
          loading ?
            <Loading width={clip.height} height={clip.height} /> :
            <Video videoUrl={clip.videoUrl} animationUrl={clip.animationUrl} width={clip.width} height={clip.height} />
        }
      </div>
    </div>
  );
}

export default Create;