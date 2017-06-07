import React, { Component } from 'react'
import '../styles/game.css'

class Linescore extends Component {
  render() {
    let boxes
    if (!Array.isArray(this.props.innings)) {
      boxes = []
      let x = this.props.innings
      if (x.away_inning_runs && x.home_inning_runs) boxes.push(x)
      else if (x.away_inning_runs) boxes.push({away: x.away_inning_runs, home: '-'})
      else boxes.push({away:'-', home:'-'})
      for (let i=1; i < 9; i++) {
        boxes.push({away:'-', home:'-'})
      }
    } else {
      boxes = this.props.innings.map( x => {
        let box = {away: '-', home:'-'}
        if (x.away_inning_runs && x.home_inning_runs) box = {away:x.away_inning_runs,home:x.home_inning_runs}
        else if (x.away_inning_runs) box = {away: x.away_inning_runs, home: '-'}
        return box
      })
      for (let i=this.props.innings.length; i < 9; i++) {
        boxes.push({away:'-',home:'-'})
      }
    }
    let line = this.props.linescore
    let innings = <div>
                    <div className='box'>
                      <p>{this.props.currentInning.state} {this.props.currentInning.num || 1}</p>
                      <p>{this.props.teams.home || '-'}</p>
                      <p>{this.props.teams.away || '-'}</p>
                    </div>
                    { boxes.map((x, i) => {
                        return <div key={i} className='box'><p>{i + 1}</p><p>{x.away}</p><p>{x.home}</p></div>})}
                    <div className='box'><p>R</p><p>{line.away_team_runs || '-'}</p><p>{line.home_team_runs || '-'}</p></div>
                    <div className='box'><p>H</p><p>{line.away_team_hits || '-'}</p><p>{line.home_team_hits || '-'}</p></div>
                    <div className='box'><p>E</p><p>{line.away_team_errors || '-'}</p><p>{line.home_team_errors || '-'}</p></div>
                  </div>
    return (
      <div>
        {innings}
      </div>
    )
  }
}

export default Linescore