import React, { Component } from 'react'
import '../styles/game.css'

class Preview extends Component {
  constructor() {
    super()
    this.loaded = false
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.linescore.game.id && ('gid_' + nextProps.linescore.game.id.replace(/\/|-/gi, '_') === this.props.params.gameid))
      this.loaded = true
  }

  componentDidMount() {
    setTimeout(()=>this.props.loadGame(this.props.params.gameid, true), 1000)
  }
  render() {
    let line = this.props.linescore
    let res 
    if (!this.loaded || line.empty || line.id && this.props.params.gameid !== 'gid_' + line.id.replace(/\/|-/gi, '_')) {
      res = <div>loading...</div>
    } else {
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