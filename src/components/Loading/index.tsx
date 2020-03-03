import React, { useEffect } from 'react';
import lottie from 'lottie-web';

const path = `${process.env.PUBLIC_URL}/assets/loading.json`;

interface IProps {
  width: number;
  height: number;
  cssProps?: React.CSSProperties
}

function Loading({ width, height, cssProps }: IProps) {
  useEffect(() => {
    const container = document.getElementById('loadingContainer');
    lottie.loadAnimation({
      container,
      renderer: 'canvas',
      loop: true,
      autoplay: true,
      path
    });
  }, []);

  return (
    <div id="loadingContainer" style={{ width, height, ...cssProps }} ></div>
  );
}

export default Loading;