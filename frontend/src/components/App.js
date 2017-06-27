import React, { Component } from 'react'
import '../styles/app.css'
import { Link } from 'react-router'
import axios from 'axios'
import GameBox from './GameBox.js'

class App extends Component {
  constructor() {
    super()
    this.state = {
      homeDateString: '',
      homeDate: new Date(),
      homeGames: [],
      todaysGames: [],
      gameID: '',
      gameStatus: null,
      teamDisplayed: 'home',
      boxscore: {empty: true},
      innings: {empty: true},
      linescore: {empty:true},
      currBatter:{empty:true},
      update:true
    }
    this.switchTeamDisplayed = this.switchTeamDisplayed.bind(this)
    this.startGameUpdates = this.startGameUpdates.bind(this)
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
    console.log('startGameUpdates')
    this.getGameInfo()
    const clear = setInterval(() => {
      if (this.state.gameStatus === 'Preview' || this.state.gameID !== gameID) clearInterval(clear)
      else this.getGameInfo()
    }, 2000)
  }

  getGameInfo() {
    axios.get('http://localhost:8080/updategame')
          .then( res => {
            console.log(res.data)
            this.setState({
              boxscore: res.data.boxscore,
              gameStatus: res.data.gameStatus,
              innings: res.data.innings,
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
      axios.get('http://localhost:8080/updatenavbar')
         .then(res => {
           this.setState({
             homeGames: this.state.homeGames === [] ? res.data : this.state.homeGames,
             todaysGames: res.data
           })
         })
         .catch(err => {
           console.log(err)
         })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.pathname === '/') {
      axios.get('http://localhost:8080/')
           .then( res => {
             this.setState({
               gameID: ''
            })
          }).catch( e => {
            console.log(e)
          })
    }
    else if (nextProps.params.gameid && (nextProps.params.gameid !== this.props.params.gameid) || !this.props.params.gameid) {
      this.setState({
        gameID: nextProps.params.gameid,
        boxscore: {empty: true},
        innings: {empty: true},
        linescore: {empty:true},
        currBatter:{empty:true}
      })
      let isPreview = nextProps.location.pathname.split('/')[1] === 'preview'
      let isToday = true
      this.loadGame(nextProps.params.gameid, isPreview, isToday)
    }
  }

  loadGame(gameID, isPreview, isToday) {
    console.log('loadGame()', gameID, isPreview, isToday)
    if (!gameID) return
    if (isPreview) {
      axios.get(`http://localhost:8080/preview/${isToday ? 'today' : 'selectedday'}/${gameID}`)
          .then( res => {
            this.setState({
              linescore: res.data.linescore
            })
          }).catch(e => {
            console.log(e)
          })
    } else {
      axios.get(`http://localhost:8080/games/${isToday ? 'today' : 'selectedday'}/${gameID}`)
            .then( res => {
              this.startGameUpdates(gameID)
            }).catch(err => {
              console.log(err)
            })
    }
  }

  componentDidMount() {
    this.updateNavbar(false)
    this.updateNavbar(true)
  }

  changeDate(dateString) {
    axios.get(`http://localhost:8080/gamesfordate/${dateString}`)
         .then( res => {
           this.setState({
             homeGames: res.data,
             homeDateString: dateString
           })
         }).catch( e => {
           console.log(e)
         })
  }

  padDigit(n) {
    return n < 10 ? '0' + n : String(n)
  }

  dateStringify(date) {
    return date.getFullYear() + '-' + this.padDigit(Number(date.getMonth()) + 1) + '-' + this.padDigit(date.getDate())
  }

  render() {
    const gameboxes = this.state.todaysGames.map( (x, i) => {
      return <GameBox game={x} 
                      key={i}
                      linkURL={((x.status === 'Preview' || x.status === 'Pre-Game') ? '/preview/gid_' : '/games/gid_') + x.gameday_link}
                      updateApp={this.updateApp} />
    })
    return (
      <div className="App">
        <Link to='/'><button className='btn btn-default'>Home</button></Link>
        <div className='navbar'>
          {gameboxes}
        </div>
        {React.cloneElement(this.props.children, { 
                                                   boxscore: this.state.boxscore,
                                                   innings: this.state.innings,
                                                   linescore: this.state.linescore,
                                                   homeGames: this.state.homeGames,
                                                   currBatter: this.state.currBatter,
                                                   gameID: this.state.gameID,
                                                   teamDisplayed: this.state.teamDisplayed,
                                                   switchTeamDisplayed: this.switchTeamDisplayed,
                                                   startGameUpdates: this.getGameInfo,
                                                   homeDateString: this.state.homeDateString || this.dateStringify(this.state.homeDate),
                                                   homeDate: this.state.homeDate,
                                                   changeDate: this.changeDate,
                                                   loadGame: this.loadGame
                                                }
                            )
        }
      </div>
    )
  }
}

export default App