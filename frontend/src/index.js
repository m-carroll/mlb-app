import React from 'react'
import ReactDOM from 'react-dom'
import {Router, Route, IndexRoute, hashHistory } from 'react-router'

import App from './components/App.js'
import Home from './components/Home.js'
import Game from './components/Game.js'
import Preview from './components/Preview.js'

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path='/' component={App}>
      <IndexRoute component={Home}/>
      <Route path='/games/:gameid' component={Game}/>
    </Route>
  </Router>,
  document.getElementById('root')
);