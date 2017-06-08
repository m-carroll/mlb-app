import React, { Component } from 'react'
import '../styles/app.css'
import { Link } from 'react-router'
import axios from 'axios'
import GameBox from './GameBox.js'

class App extends Component {
  constructor() {
    super()
    this.state = {
      homeDate: new Date(),
      homeGamesDisplayed: [],
      games: [],
      gameID: '',
      gameStatus: 'Preview',
      teamDisplayed: 'home',
      rosters: {home: [],away: []},
      gameInfo: {
        linescore: {inning_line_score:[]},
        home_team_code: '',
        away_team_code: '',
        batting: [{batter:[]}, {batter:[]}],
        pitching: [{pitcher:[]},{pitcher:[]}]
      },
      atBats: {empty: true},
      linescore: {empty:true},
      currBatter:{empty:true},
      update:true
    }
    this.switchTeamDisplayed = this.switchTeamDisplayed.bind(this)
    this.startGameUpdates = this.startGameUpdates.bind(this)
    this.toggleServer = this.toggleServer.bind(this)
    this.updateNavbar = this.updateNavbar.bind(this)
    this.changeDate = this.changeDate.bind(this)
    this.loadGame = this.loadGame.bind(this)
  }

  switchTeamDisplayed(team) {
    this.setState({
      teamDisplayed: team
    })
  }

  startGameUpdates(gameID) {
    setTimeout(() => this.getGameInfo(gameID), 1000)
    const clear = setInterval(() => {
      if (!this.state.gameID || this.state.gameStatus === 'Preview' || !this.state.update) clearInterval(clear)
      else this.getGameInfo(gameID)
    }, 2000)
  }

  getGameInfo(gameID) {
    if (!gameID) return
    axios.get('http://localhost:8080/updategame')
          .then( res => {
            if (res.data.gameID !== gameID) return
            this.setState({
              gameID: gameID,
              gameInfo: res.data.gameInfo,
              gameStatus: res.data.gameStatus,
              atBats: res.data.atBats,
              linescore: res.data.linescore,
              currBatter: res.data.currBatter,
            })
          }).catch(e => {
            console.log(e)
          })
  }

  updateNavbar(loop) {
    if (loop) {
      const clear = setInterval(() => {
        if (!this.state.update) clearInterval(clear)
        this.updateNavbar(false)
      }, 10000)
    }
    else {
      axios.get('http://localhost:8080/updatenavbar')
         .then(res => {
           this.setState({
              games: res.data
           })
         })
         .catch(err => {
           console.log(err)
         })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.pathname === '/') {
      axios.get('/')
           .then( res => {
             this.setState({
               gameID: ''
            })
          }).catch( e => {
            console.log(e)
          })
    }
    if (nextProps.params.gameid !== this.props.params.gameid) {
      this.setState({
        atBats:{empty:true}
      })
      let isPreview = nextProps.location.pathname.split('/')[1] === 'preview'
      this.loadGame(nextProps.params.gameid, isPreview)
    }
  }

  loadGame(gameID, isPreview) {
    if (!gameID) return
    if (isPreview) {
      axios.get('http://localhost:8080/preview/' + gameID)
          .then( res => {
              setTimeout(() => {
                this.setState({
                  linescore: res.data
                })
              }, 1000)
          }).catch(e => {
            console.log(e)
          })
    } else {
      axios.get('http://localhost:8080/games/' + gameID)
            .then( res => {
              if (res.data.gameID !== gameID) return
              this.startGameUpdates(gameID)
            }).catch(err => {
              console.log(err)
            })
    }
  }

  toggleServer() {
    if (!this.state.update) {
      this.updateNavbar(true)
      this.startGameUpdates(this.state.gameID)
    } else {
      axios.post('http://localhost:8080/stopserver')
           .then(res => {
             console.log(res.data.success)
           })
    }
    this.setState({
      update: !this.state.update
    })
  }

  componentDidMount() {
    this.updateNavbar(false)
    this.updateNavbar(true)
  }

  changeDate(date) {
    axios.get(`http://localhost:8080/gamesfordate/${this.padDigit(date.getFullYear())}_${this.padDigit(Number(date.getMonth()+1))}_${this.padDigit(date.getDate())}`)
         .then( res => {
           this.setState({
             homeGamesDisplayed: res.data,
             homeDate: date
           })
         }).catch( e => {
           console.log(e)
         })
  }

  padDigit(n) {
    return n < 10 ? '0' + n : String(n)
  }

  render() {
    const gameboxes = this.state.games.map( (x, i) => {
      return <GameBox game={x} 
                      key={i}
                      linkURL={(x.status === 'Preview' ? '/preview' : '/games') + `/gid_${x.id.replace(/\/|-/gi, '_')}`}
                      updateApp={this.updateApp} />
    })
    return (
      <div className="App">
        <Link to='/'><button className='btn btn-default'>Home</button></Link>
        <button className='btn btn-default' onClick={this.toggleServer}>{this.state.update ? 'Disconnect from server' : 'Reconnect to server'}</button>
        <div className='navbar'>
          {gameboxes}
        </div>
        {React.cloneElement(this.props.children, { 
                                                   gameInfo: this.state.gameInfo,
                                                   gameID: this.state.gameID,
                                                   teamDisplayed: this.state.teamDisplayed,
                                                   atBats: this.state.atBats,
                                                   linescore: this.state.linescore,
                                                   switchTeamDisplayed: this.switchTeamDisplayed,
                                                   startGameUpdates: this.getGameInfo,
                                                   homeDate: this.state.homeDate,
                                                   changeDate: this.changeDate,
                                                   homeGamesDisplayed: this.state.homeGamesDisplayed,
                                                   currBatter: this.state.currBatter,
                                                   loadGame: this.loadGame
                                                }
                            )
        }
      </div>
    )
  }
}

export default App