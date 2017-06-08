import React, { Component } from 'react'
import '../styles/game.css'

class Preview extends Component {
  constructor() {
    super()
    this.loaded = false
  }

  componentDidUpdate() {
    if (!this.loaded) this.props.loadGame(this.props.params.gameid, true)
  }

  componentDidMount() {
    this.props.loadGame(this.props.params.gameid, true)
  }
  render() {
    let line = this.props.linescore
    let res 
    if (line.empty || line.id && this.props.params.gameid !== 'gid_' + line.id.replace(/\/|-/gi, '_')) {
      this.loaded = false
      res = <div>loading...</div>
    } else {
      this.loaded = true
      line = this.props.linescore.game
      let ap = line.away_probable_pitcher
      let hp = line.home_probable_pitcher
      res = <div className='preview'>
              <h1>
                {line.away_team_name} ({line.away_win}-{line.away_loss}) at {line.home_team_name} ({line.home_win}-{line.home_loss})
              </h1>
              <div className='pitchers'>
                <h3>Probable Pitchers:</h3>
                <h4>{line.away_name_abbrev}: {ap.first} {ap.last} {ap.s_era} ERA, {ap.s_wins}-{ap.s_losses} on the season</h4>
                <h4>{line.home_name_abbrev}: {hp.first} {hp.last} {hp.s_era} ERA, {hp.s_wins}-{hp.s_losses} on the season</h4>
                <h4>First Pitch: {line.first_pitch_et || line.time} EST</h4>
              </div>
            </div>
    }
    return res
  }
}

export default Preview