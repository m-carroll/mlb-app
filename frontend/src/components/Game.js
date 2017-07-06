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
      halfToDisplay:'BOTH'
    }
    this.setInningAtBats = this.setInningAtBats.bind(this)
    this.showHideCard = this.showHideCard.bind(this)
    this.setHalf = this.setHalf.bind(this)
  }

  setHalf(half) {
    this.setState({
      halfToDisplay:half
    })
  }

  componentDidMount() {
    //this is for refreshing, does not remount when changing games
    this.props.loadGame(this.props.params.gameid)
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
    //if the next props contain a new atbat for the selected inning
    if (nextProps.atBats.inning) {
      this.setInningAtBats(this.state.selectedInningForAtBats)
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
    console.log(this.props)
    let res
    if (this.props.linescore.status === 'Preview') {
      let line = this.props.linescore
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
    else if ( !this.props.gameID || 
         this.props.linescore.empty || 
         this.props.boxscore.empty || 
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
      const currBatter = this.props.currBatter,
            currentAtBat = !currBatter.empty ? <AtBat 
                                                  index={0}
                                                  half={currBatter.inningState}
                                                  inning={currBatter.inning}
                                                  atBat={currBatter.game}
                                                  pitches={Array.isArray(currBatter.game.atbat.p) ? currBatter.game.atbat.p : currBatter.game.atbat.p ? [currBatter.game.atbat.p] : []}
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
                                                                                  pitches={Array.isArray(x.pitch) ? x.pitch : x.pitch ? [x.pitch] : []}
                                                                                  hidden={this.state.hiddenCards[i]}
                                                                                  showHideCard={this.showHideCard}
                                                                                  isCurrentBatter={false}
                                                                                  halfToDisplay={this.state.halfToDisplay}
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
              {this.props.linescore.status}{this.props.linescore.status && this.props.linescore.status !== 'Final' && this.props.linescore.status !== 'In Progress' ? `, Starts at ${this.props.linescore.time} ${this.props.linescore.ampm} EST`: null}
              <br/>{this.props.linescore.status === 'Final' ? null : 
                  (baserunners[this.props.linescore.runner_on_base_status] + ', ' + this.props.linescore.inning_state + ' ' + this.props.linescore.inning + ', ' + this.props.linescore.outs + ' out')}
            </h4>
            {inningsButtons}
            <div className='atbat-container'>
              <button className={`btn btn-block btn-${this.state.halfToDisplay === 'TOP' ? 'primary' : ''}`} onClick={() => this.setHalf('TOP')}>Top</button>
              <button className={`btn btn-block btn-${this.state.halfToDisplay === 'BOTTOM' ? 'primary' : ''}`} onClick={() => this.setHalf('BOTTOM')}>Bottom</button>
              <button className={`btn btn-block btn-${this.state.halfToDisplay === 'BOTH' ? 'primary' : ''}`} onClick={() => this.setHalf('BOTH')}>Both</button>
              {atBatsForSelectedInning.filter(x => {return x.props.half !== 'Top'}).reverse()}
              {atBatsForSelectedInning.filter(x => {return x.props.half === 'Top'}).reverse()}
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
                            linescore={this.props.boxscore.linescore}/>
                <div className="lineups-container">
                  <div className='lineup-toggle-box'>
                    <button className=' btn btn-lg btn-default' onClick={() => this.props.switchTeamDisplayed('home')}>{this.props.boxscore.home_sname}</button>
                    <button className='btn btn-lg btn-default' onClick={() => this.props.switchTeamDisplayed('away')}>{this.props.boxscore.away_sname}</button>
                  </div>
                  <Lineup batters={this.props.boxscore.batting[this.props.teamDisplayed === 'home' ? 0 : 1]} 
                          pitchers={this.props.boxscore.pitching[this.props.teamDisplayed === 'home' ? 1 : 0]}/>
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