import React, { useEffect, useState } from 'react';
import "./styles.scss";
import { getClips } from "../../api/firestore/clips";
import { Link } from 'react-router-dom';

function Home() {
  const initClips: any[] = [];
  const [clips, setClips] = useState(initClips);

  useEffect(() => {
    const fetchData = async () => {
      const results = await getClips();
      setClips([...results]);
    }

    fetchData();
  }, []);

  return (
    <div className="container">
      <ul className="list">
        {
          clips.map((clip) => (
            <li key={clip.id}>
              <Link to={`/clip/${clip.id}`}>
                <img src={clip.thumbnailUrl} alt={clip.title}></img>
                <p>{clip.title}</p>
              </Link>
            </li>
          ))
        }
      </ul>
    </div>
  );
}

export default Home;