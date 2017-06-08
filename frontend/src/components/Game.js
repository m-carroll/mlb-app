import React, { Component } from 'react'
import '../styles/game.css'
import Linescore from './Linescore'
import AtBat from './AtBat'
import Lineup from './Lineup'

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

  componentDidMount() {
    //this is for refreshing, does not remount when changing games
    this.props.loadGame(this.props.params.gameid, false)
  }

  showHideCard(index) {
    let hiddenCards = this.state.hiddenCards.concat()
    if (index < hiddenCards.length) hiddenCards[index] = !hiddenCards[index]
    this.setState({
      hiddenCards: hiddenCards
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params.gameid !== nextProps.params.gameid) {
      this.setState({
        selectedInningForAtBats: 0,
        selectedInningAtBats: []
      })
    }
    if (this.props.atBats.empty && !nextProps.atBats.empty) {
      setTimeout(() => this.setInningAtBats(this.props.linescore.inning), 500)
    }
  }

  setInningAtBats(inningNumber) {
    let inning = []
    let hiddenCards = []
    if (inningNumber && !this.props.atBats.empty) {
      let atBatsInning = Array.isArray(this.props.atBats.inning) ? this.props.atBats.inning[inningNumber-1] : this.props.atBats.inning
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
      this.setState({
        selectedInningAtBats: inning,
        selectedInningForAtBats: inningNumber,
        hiddenCards: hiddenCards
      })
    }
  }

  render() {
    let res
    // if (this.props.linescore.id) console.log('gid_' + this.props.linescore.id.replace(/\/|-/, '_'))
    if ( !this.props.gameID || 
         this.props.linescore.empty || 
         this.props.gameInfo.empty || 
         this.props.atBats.empty || 
         this.props.linescore.id && this.props.gameID !== 'gid_' + this.props.linescore.id.replace(/\/|-/gi, '_') ||
         this.props.currBatter.game && this.props.params.gameid !== 'gid_' + this.props.currBatter.game.id
      )
      res = <div>loading...</div>
    else {
      const baserunners = [
                            'Bases empty', 
                            'Runner on first', 
                            'Runner on second', 
                            'Runner on third', 'Runners on first and second', 
                            'Runners on second and third', 
                            'Bases loaded'
                          ]
      const currBatter = this.props.currBatter
      const currentAtBat = !currBatter.empty ? <AtBat 
                                                  index={0}
                                                  half={currBatter.inningState}
                                                  inning={currBatter.inning}
                                                  atBat={currBatter.game}
                                                  pitches={Array.isArray(currBatter.game.atbat.p) ? currBatter.game.atbat.p : [currBatter.game.atbat.p]}
                                                  hidden={false}
                                                  showHideCard={(i)=>{console.log("you can't hide from me!")}}
                                                  isCurrentBatter={true}
                                                  onDeck={currBatter.game.players.deck}
                                                  inHole={currBatter.game.players.hole}
                                                  /> : <span/>
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
      res = (
        <div className="game">
          <div className='left-column'>
            <h2>
              {this.props.linescore.away_name_abbrev} {this.props.linescore.away_team_runs} | {this.props.linescore.home_name_abbrev} {this.props.linescore.home_team_runs}
            </h2>
            <h4>  
            {this.props.linescore.status === 'Final' ? 'Final' : 
                (baserunners[this.props.linescore.runner_on_base_status] + ', ' + this.props.linescore.inning_state + ' ' + this.props.linescore.inning + ', ' + this.props.linescore.outs + ' out')}
            </h4>
            {inningsButtons}
            <div className='atbat-container'>
              <h1 className='atbat'>TOP</h1>
              {atBatsForSelectedInning.filter(x => {return x.props.half === 'Top'})}
              <h1 className='atbat'>Bottom</h1>
              {atBatsForSelectedInning.filter(x => {return x.props.half !== 'Top'})}
            </div>
          </div>
          <div className='middle-column'>
            {currentAtBat}
          </div>
          <div className='right-column'>
            <div className='flex'>
              <div>
                <Linescore currentInning={{num:this.props.linescore.inning, state:this.props.linescore.inning_state || 'END'}}
                            innings={this.props.linescore.linescore} 
                            teams={{home: this.props.linescore.home_name_abbrev, away: this.props.linescore.away_name_abbrev}}
                            linescore={this.props.gameInfo.linescore}/>
                <div className="lineups-container">
                  <div className='lineup-toggle-box'>
                    <button className=' btn btn-lg btn-default' onClick={() => this.props.switchTeamDisplayed('home')}>{this.props.gameInfo.home_sname}</button>
                    <button className='btn btn-lg btn-default' onClick={() => this.props.switchTeamDisplayed('away')}>{this.props.gameInfo.away_sname}</button>
                  </div>
                  <Lineup batters={this.props.gameInfo.batting[this.props.teamDisplayed === 'home' ? 0 : 1]} 
                          pitchers={this.props.gameInfo.pitching[this.props.teamDisplayed === 'home' ? 1 : 0]}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return res || <div>failed to load</div>
  }
}

export default Game