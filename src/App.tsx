import React from 'react';
import './App.css';
import VideoItem from "./components/VideoItem"

const assetsPath = `${process.env.PUBLIC_URL}/assets/`;
const animPath = `${assetsPath}1.json`;
const videoPath = `${assetsPath}shot1.mp4`;

interface IProps {
  
}

interface IState {
  isProcessing: boolean;
}

// TODO:
// https://cf-api-prod-phoenix.jibjab.com/v1/template_groups/the-git-up-blanco-brown-starring-you-ecard
// https://www.jibjab.com/video_assets/d3cd5883-31c4-4987-ab9c-ea2b380a87f2/original/9c8f60ec-b758-44a0-99ee-837dcae55575-The_Git_Up_NG_w640x720.mp4
// https://cf-assets-prod-phoenix.jibjab.com/templates/the-git-up-blanco-brown-starring-you-ecard/original/566082e2-198f-45fe-98d6-9f3ee8b41425-position_data.txt
class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      isProcessing: false
    };
  }

  async componentDidMount() {
    
  }

  render() {
    return (
      <div className="App">
        <VideoItem videoUrl={videoPath} animationUrl={animPath} />
      </div>
    );
  }
}

export default App;
