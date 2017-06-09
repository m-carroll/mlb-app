import React, { Component } from 'react'
import { Link } from 'react-router'
import '../styles/app.css'

class GameBox extends Component {
  render() {
    let x = this.props.game
    let splitURL = this.props.linkURL.split('/')
    let isPreview = splitURL[1] === 'preview'
    let status = 'Final'
    if (x.status !== 'In Progress') status = x.status
    else {
      status = (x.top_inning === 'Y' ? 'Top ':'Bottom ') + x.inning
    }
    return (
      <Link className='game-box' 
            to={this.props.linkURL} 
            activeStyle={{'backgroundColor': 'lightgrey', color: 'black', textDecoration:'none'}}>
        <div>
          <span>{x.away_name_abbrev}: {x.away_team_runs || 0}
          <br/>{x.home_name_abbrev}: {x.home_team_runs || 0}
          <br/>{status}</span>
        </div>
      </Link>
    )
  }
}

export default GameBox