import React, { Component } from 'react'
import { Link } from 'react-router'
import '../styles/app.css'

class GameBox extends Component {
  render() {
    let x = this.props.game
    let splitURL = this.props.linkURL.split('/')
    let isPreview = splitURL[1] === 'preview'
    // let gameID = isPreview ? splitURL[2] : splitURL[1]
    let status = x.status
    return (
      <Link className='game-box' 
            to={this.props.linkURL} 
            activeStyle={{'backgroundColor': 'lightgrey', color: 'black', textDecoration:'none'}}>
        <div>
          <span>{x.home_name_abbrev}: {x.home_team_runs || 0}
          <br/>{x.away_name_abbrev}: {x.away_team_runs || 0}
          <br/>{x.status === 'Final' ? x.status : x.status === 'Preview' ? x.time : (x.top_inning === 'Y' ? `Top ${x.inning}`: `Bottom ${x.inning}`) || '9'}</span>
        </div>
      </Link>
    )
  }
}

export default GameBox