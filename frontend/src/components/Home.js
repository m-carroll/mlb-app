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
    this.showHideCalendar = this.showHideCalendar.bind(this)
    this.onChange = this.onChange.bind(this)
    this.padDigit = this.padDigit.bind(this)
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
      this.props.changeDate(new Date(splitDate[0], splitDate[1]+1, splitDate[2]))
      // console.log(new Date(splitDate[0], Number(splitDate[1])-1, splitDate[2]))
  }

  padDigit(n) {
    return n < 10 ? '0' + n : String(n)
  }
  
  render() {
    let date = this.props.homeDate.getFullYear() + '-' + this.padDigit((Number(this.props.homeDate.getMonth())+1)) + '-' + this.padDigit(this.props.homeDate.getDate())
    const games = this.props.homeGamesDisplayed.map( x => {
      return <Link to={`/games/${x.id}`}>
               {x.away_team_name} ({x.away_win}-{x.away_loss}) at {x.home_team_name} ({x.home_win}-{x.home_loss}) | {x.time} {x.ampm} {x.time_zone}
             </Link>
    })
    const content = <div>
                        <button className='btn btn-default' onClick={this.showHideCalendar}>{this.state.hidden ? 'Select a date' : 'Hide calendar'}</button>
                        <div className={this.state.hidden ? 'hidden' : ''}>
                          <Calendar
                            dateFormat="YYYY-MM-DD"
                            date={this.date}
                            onChange={this.onChange}
                          />
                        </div>
                      </div>
    return (
    <div className='home'>
    </div>
    )
  }
}

export default Home