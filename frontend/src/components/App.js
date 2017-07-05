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
      gameStatus: '',
      teamDisplayed: 'home',
      boxscore: {
        linescore: {inning_line_score:[]},
        home_team_code: '',
        away_team_code: '',
        batting: [{batter:[]}, {batter:[]}],
        pitching: [{pitcher:[]},{pitcher:[]}]
      },
      atBats: {empty: true},
      linescore: {empty:true},
      currBatter:{empty:true},
    }
    this.switchTeamDisplayed = this.switchTeamDisplayed.bind(this)
    this.updateNavbar = this.updateNavbar.bind(this)
    this.changeDate = this.changeDate.bind(this)
    this.loadGame = this.loadGame.bind(this)
  }

  switchTeamDisplayed(team) {
    this.setState({
      teamDisplayed: team
    })
  }

  getGameInfo(gameID) {
    axios.get('/games/' + gameID)
          .then( res => {
            if (gameID !== this.state.gameID) return
            console.log(res.data)
            this.setState({
              gameID: gameID,
              boxscore: res.data.boxscore,
              gameStatus: res.data.linescore.status || 'Preview',
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
      }, 2000)
    }
    else {
      axios.get('/updatenavbar')
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
    else if (nextProps.params.gameid !== this.props.params.gameid) {
      this.setState({
        atBats:{empty:true}
      })
      this.loadGame(nextProps.params.gameid)
    }
  }

  loadGame(gameID) {
    this.setState({
      gameID:gameID,
    })
    this.getGameInfo(gameID)
    const clear = setInterval(() => {
      if (!this.state.gameID || gameID !== this.state.gameID) clearInterval(clear)
      else this.getGameInfo(gameID)
    }, 10000)
  }

  componentDidMount() {
    this.updateNavbar(false)
    this.updateNavbar(true)
  }

  changeDate(date) {
    const homeDate = this.state.homeDate
    if (
        date.getFullYear() === homeDate.getFullYear() && 
        date.getMonth() === homeDate.getMonth() && 
        date.getDate() === homeDate.getDate() && 
        this.state.homeGamesDisplayed.length
      ) return
    const dateString = `${this.padDigit(date.getFullYear())}_${this.padDigit(Number(date.getMonth()+1))}_${this.padDigit(date.getDate())}`
    axios.get(`/gamesfordate/${dateString}`)
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
                      linkURL={`/games/gid_${x.id.replace(/\/|-/gi, '_')}`}
                      />
    })
    return (
      <div className="App">
        <Link to='/'><button className='btn btn-default'>Home</button></Link>
        <div className='navbar'>
          {gameboxes}
        </div>
        {React.cloneElement(this.props.children, { 
                                                   boxscore: this.state.boxscore,
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