import React, { Component } from 'react'
import '../styles/game.css'
// import { Link } from 'react-router'
// import axios from 'axios'
// import {XYPlot, XAxis, YAxis, HorizontalGridLines, MarkSeries} from 'react-vis'
import Linescore from './Linescore'
import AtBat from './AtBat'
import Lineup from './Lineup'

/**
 * TODO: 
 * 1) fix react-vis, add strikezone, switch to d3, color code dots, add mouseover?
 *X2) add innings dropdown box, toggle to all atbats for selected inning
 *X3) fix inning tag on linescore
 *X4) make app header showing all game scores/times
 * 5) figure out where baserunners are, how to visualize
 * 6) create player db
 */


class Game extends Component {
  constructor() {
    super()
    this.state={
      selectedInningForAtBats:0,
      selectedInningAtBats:[],
    }
    this.setInningAtBats = this.setInningAtBats.bind(this)
    this.showHideCard = this.showHideCard.bind(this)
  }

  // mountGame() {
  //   this.props.mountGame(this.props.params.gameid, 'games')
  // }

  componentDidMount() {
    this.setState({
      selectedInningAtBats:[],
      selectedInningForAtBats:0,
      hiddenCards: [],
    })
    this.props.startGameUpdates()
  }

  showHideCard(index) {
    let hiddenCards = this.state.hiddenCards.concat()
    if (index < hiddenCards.length) hiddenCards[index] = !hiddenCards[index]
    this.setState({
      hiddenCards: hiddenCards
    })
  }

  setInningAtBats(inningNumber) {
    let inning = []
    let hiddenCards = []
    if (inningNumber) {
      let atBatsInning = Array.isArray(this.props.atBats.inning) ? this.props.atBats.inning[inningNumber-1] : [this.props.atBats.inning]
      if (atBatsInning.top) {
        inning = inning.concat(Array.isArray(atBatsInning.top.atbat) ? atBatsInning.top.atbat.map(x => {
        x.half = 'Top'
        x.inning = inningNumber
        return x
      }) : atBatsInning.top.atbat ? [atBatsInning.top.atbat] : [])
      }
      if (atBatsInning.bottom) {
        inning = inning.concat(Array.isArray(atBatsInning.bottom.atbat) ? atBatsInning.bottom.atbat.map(x => {
          x.half = 'Bottom'
          x.inning = inningNumber
          return x
        }) : atBatsInning.bottom.atbat ? [atBatsInning.bottom.atbat] : [])
      }
      hiddenCards = inning.map( x => {return true})
    }
    this.setState({
      selectedInningAtBats: inning,
      selectedInningForAtBats: inningNumber,
      hiddenCards: hiddenCards
    })
  }

  render() {
    const currBatter = this.props.currBatter
    const currentAtBat = <span/>
    /*!currBatter.empty ? <AtBat 
                                                index={0}
                                                half={currBatter.top ? 'Top' : 'Bottom'}
                                                inning={currBatter.inning}
                                                atBat={currBatter.atbat}
                                                pitches={Array.isArray(currBatter.atbat.p) ? currBatter.atbat.p : [currBatter.atbat.p]}
                                                hidden={false}
                                                showHideCard={(i)=>{console.log("you can't hide from me!")}}
                                                isCurrentBatter={true}
                                                /> : <span/>*/
    const atBatsForSelectedInning = this.state.selectedInningAtBats.map((x, i) => {
                                                                  return <AtBat key={i}
                                                                                index={i}
                                                                                half={x.half}
                                                                                inning={x.inning}
                                                                                atBat={x}
                                                                                pitches={Array.isArray(x.pitch) ? x.pitch : [x.pitch]}
                                                                                hidden={this.state.hiddenCards[i]}
                                                                                showHideCard={this.showHideCard}
                                                                                isCurrentBatter={false}
                                                                                />
                                                                })
    let inningsButtons = []
    for (let i=0; i < this.props.linescore.inning; i++) {
      inningsButtons.push(<button key={i} 
                                  className={`btn btn-${(i+1) === this.state.selectedInningForAtBats ? 'primary' : 'default'}`} 
                                  onClick={() => this.setInningAtBats(i+1)}>{i+1}
                                  </button>)
    }
    let res
    if (!this.props.gameID || this.props.linescore.empty || this.props.gameInfo.empty || this.props.atBats.empty)
      res = <div>loading...</div>
    else res = (
      <div className="game">
        <Linescore currentInning={{num:this.props.linescore.inning, state:this.props.linescore.inning_state || 'END'}}
                   innings={this.props.linescore.linescore} 
                   teams={{home: this.props.linescore.home_name_abbrev, away: this.props.linescore.away_name_abbrev}}
                   linescore={this.props.gameInfo.linescore}/>
        <div className="lineups-container">
          <div className='lineup-toggle-box'>
            <button className='btn btn-default' onClick={this.props.switchTeamDisplayed}>{this.props.gameInfo.home_sname}</button>
            <button className='btn btn-default' onClick={this.props.switchTeamDisplayed}>{this.props.gameInfo.away_sname}</button>
          </div>
          <Lineup batters={this.props.gameInfo.batting[this.props.teamDisplayed === 'home' ? 0 : 1].batter} 
                  pitchers={this.props.gameInfo.pitching[this.props.teamDisplayed === 'home' ? 1 : 0]}/>
        </div>
        <div>
          <div className='atbats-selector-container'>
              <h2>{this.props.currentInningNumberToDisplayAtBats ? `Inning ${this.props.currentInningNumberToDisplayAtBats}` : 'At-bats by inning'}</h2>
              {inningsButtons}
              <button className='btn btn-default' onClick={() => this.setInningAtBats(0)}>None</button>
            <div className={`${this.state.selectedInningForAtBats ? 'inning-atbats' : 'hidden'}`}>
              {atBatsForSelectedInning}
            </div>
          </div>
          {currentAtBat}
        </div>
      </div>
    )
    return res || <div>failed to load</div>
  }
}

export default Game