import React from 'react';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom';
import './App.scss';
import Home from "./pages/Home";
import Clip from "./pages/Clip";
import Create from "./pages/Clip/Create";
import NoMatch from "./pages/NoMatch";
import Menu from "./components/Menu";

// TODO:
// https://cf-api-prod-phoenix.jibjab.com/v1/template_groups/the-git-up-blanco-brown-starring-you-ecard
// https://www.jibjab.com/video_assets/d3cd5883-31c4-4987-ab9c-ea2b380a87f2/original/9c8f60ec-b758-44a0-99ee-837dcae55575-The_Git_Up_NG_w640x720.mp4
// https://cf-assets-prod-phoenix.jibjab.com/templates/the-git-up-blanco-brown-starring-you-ecard/original/566082e2-198f-45fe-98d6-9f3ee8b41425-position_data.txt


function App() {
  return (
    <Router>
      <div className="App">
        <Menu />
        <div className="app-container">
          <div className="app-body">
            <Switch>
              <Route path="/" exact> <Home /> </Route>
              {/* <Route path="/clip" exact> <Clip /> </Route> */}
              <Route path="/clip/:id" exact children={<Clip />} />
              <Route path="/clip/create/:id" exact children={<Create />} />
              <Route path="*"> <NoMatch /> </Route>
            </Switch>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
