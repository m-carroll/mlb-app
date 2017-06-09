import React, { Component } from 'react'
import '../styles/home.css'
import { Link } from 'react-router'
import 'react-date-picker/index.css'
import { DateField, Calendar } from 'react-date-picker'
import axios from 'axios'

class Home extends Component {
  constructor() {
    super()
    this.state = {
      hidden: true,
      showGames:true
    }
    this.today = new Date()
    this.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    this.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    this.showHideCalendar = this.showHideCalendar.bind(this)
    this.onChange = this.onChange.bind(this)
    this.padDigit = this.padDigit.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.homeGamesDisplayed !== this.props.homeGamesDisplayed) {
      this.setState({
        showGames: true
      })
    }
  }

  isCurrentDay() {
    const currDate = new Date()
    const homeDate = this.props.homeDate
    return homeDate.getFullYear() === currDate.getFullYear() && homeDate.getMonth() === currDate.getMonth() && homeDate.getDate() === currDate.getDate()
  }

  showHideCalendar() {
    this.setState({
      hidden:!this.state.hidden
    })
  }
  
  onChange (dateString, { dateMoment, timestamp }) {
      const splitDate = dateString.split('-')
      this.props.changeDate(new Date(splitDate[0], Number(splitDate[1]-1), splitDate[2]))
      this.showHideCalendar()
      this.setState({
        showGames:false
      })
  }

  padDigit(n) {
    return n < 10 ? '0' + n : String(n)
  }
  
  render() {
    let games = this.props.homeGamesDisplayed.map( (x, i) => {
      return (
              <div key={i}>
                <Link 
                  to={`/${x.status === 'Preview' ? 'preview' : 'games'}/gid_${x.id.replace(/\/|-/gi, '_')}`}
                  style={{color: 'black', textDecoration:'none'}}
                  >
                  <h3>{x.away_team_name} ({x.away_win}-{x.away_loss}) at {x.home_team_name} ({x.home_win}-{x.home_loss}) | {x.time} {x.ampm} {x.time_zone}</h3>
                </Link>
              </div>
      )
    })
    const content = <div>
                      <button className='btn btn-default' onClick={this.showHideCalendar}>{this.state.hidden ? 'Select a date' : 'Hide calendar'}</button>
                      <button className='btn btn-default' onClick={() => this.props.changeDate(this.today)}>Today's games</button>
                      <div className={this.state.hidden ? 'hidden' : ''}>
                        <Calendar
                          dateFormat="YYYY-MM-DD"
                          date={this.props.homeDate.getFullYear()+'-'+this.padDigit((Number(this.props.homeDate.getMonth())+1))+'-'+this.padDigit(this.props.homeDate.getDate())}
                          onChange={this.onChange}
                        />
                      </div>
                    </div>
    
    if (!this.state.showGames) {
      games = []
    }
    const d = this.props.homeDate
    return (
    <div className='home'>
      <h1>{this.days[d.getDay()]} {this.months[d.getMonth()]} {d.getDate()}, {d.getFullYear()}</h1>
      {content}
      {games}
    </div>
    )
  }
}

export default Home