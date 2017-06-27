import React from 'react'
import ReactDOM from 'react-dom'
import {Router, Route, IndexRoute, browserHistory } from 'react-router'

import App from './components/App.js'
import Home from './components/Home.js'
import Game from './components/Game.js'
import Preview from './components/Preview.js'

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path='/' component={App}>
      <IndexRoute component={Home}/>
      <Route path='/games/:gameid' component={Game}/>
      <Route path='/preview/:gameid' component={Preview}/>
    </Route>
  </Router>,
  document.getElementById('root')
);