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
      hidden: true
    }
    this.today = new Date()
    this.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    this.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    this.showHideCalendar = this.showHideCalendar.bind(this)
    this.onChange = this.onChange.bind(this)
    this.padDigit = this.padDigit.bind(this)
  }

  showHideCalendar() {
    this.setState({
      hidden:!this.state.hidden
    })
  }
  
  onChange (dateString, { dateMoment, timestamp }) {
      this.props.changeDate(dateString)
      this.showHideCalendar()
  }

  padDigit(n) {
    return n < 10 ? '0' + n : String(n)
  }
  
  render() {
    let games = this.props.homeGames.map( (x, i) => {
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
                          date={this.props.homeDateString}
                          onChange={this.onChange}
                        />
                      </div>
                    </div>
    const d = this.props.homeDateString.split('-')
    return (
    <div className='home'>
      <h1>{this.days[this.props.homeDate.getDay()]}{this.months[Number(d[1])]} {d[2]}, {d[0]}</h1>
      {content}
      {games}
    </div>
    )
  }
}

export default Home