import React, { Component } from 'react'
// import '../styles/game.css'
import { Link } from 'react-router'
import axios from 'axios'

class Player extends Component {
  constructor() {
    super()
  }
  componentDidMount() {
    this.getPlayerInfo()
  }
  getPlayerInfo() {
    console.log('player')
  }
  render() {
    return (
      <p>{this.props.params.playerid}</p>
    )
  }
}

export default Player