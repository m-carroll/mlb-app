import React, { Component } from 'react'
import '../styles/game.css'
import {XYPlot, XAxis, YAxis, HorizontalGridLines, MarkSeries, LineMarkSeries} from 'react-vis'
import PitchDetails from'./PitchDetails'

class AtBat extends Component {
  constructor() {
    super()
    this.expandPitchData = this.expandPitchData.bind(this)
    this.state = {
      pitchesShowing: []
    }
  }

  expandPitchData(index) {
    let showing = this.state.pitchesShowing.concat()
    let showingLength = this.props.pitches.length
    for (var i=showing.length-1||0; i < showingLength; i++) {
      showing.push(false)
    }
    showing[index] = !showing[index]
    console.log(showing)
    this.setState({
      pitchesShowing: showing
    })
  }

  render() {
    if (this.props.isCurrentBatter) {
      console.log(this.props.atBat)
      console.log(this.props.pitches)
    }
    const dotColour = {'S':'red', 'C':'red','B':'green', 'X':'blue'}
    let pitchArray = this.props.pitches
    let atBatData = pitchArray.map( (x, i) => {
      let xcoord = Math.floor(x.x*100)/100
      let ycoord = Math.floor(x.y*100)/100
      return {x:xcoord, y:ycoord, style:{color:'red'}}
    })
    let borderPoints = [{x:0, y:0}, {x:300, y:300}, {x:0, y:300}, {x:300, y:0}]
    let pitches = pitchArray.map((x, i) => {
      return <PitchDetails key={i} 
                           pitchNum={i+1} x={x} 
                           showing={this.state.pitchesShowing[i]} 
                           expand={(event) => this.expandPitchData(i)} />
    })
    const chart = <XYPlot
                    width={200}
                    height={200}>
                    <MarkSeries
                      data={atBatData}
                      />
                    <MarkSeries
                      data={borderPoints}
                      size={0}
                      />
                    {/*<LineMarkSeries 
                      size={1}
                      data={[
                        {x:50, y:50},
                        {x:50, y:100}
                      ]}/>
                        <LineMarkSeries 
                      size={1}
                      data={[
                        {x:50, y:100},
                        {x:100, y:100},
                      ]}/>
                        <LineMarkSeries 
                      size={1}
                      data={[
                        {x:50, y:50},
                        {x:100, y:50}
                      ]}/>
                        <LineMarkSeries 
                      size={1}
                      data={[
                        {x:100, y:100},
                        {x:100, y:50}
                      ]}/>*/}
                  </XYPlot>
    let result = <span/>
    if (this.props.isCurrentBatter) result = (
      <div className='current-atbat'>
        <div onClick={() => this.props.showHideCard(this.props.index)}>
          <h4>{this.props.half}</h4>
          <p>{this.props.atBat.atbat.des} <strong>{this.props.atBat.score.hr}-{this.props.atBat.score.ar}</strong></p>
          <p>{this.props.atBat.b}-{this.props.atBat.s}, {this.props.atBat.o} out</p>
        </div>
        <div className={`pitches ${this.props.hidden ? 'hidden' : ''}`}>
          {chart}
          {pitches}
        </div>
        <h4>
          Pitching: {this.props.atBat.players.pitcher.boxname}
          <br/>Batting: {this.props.atBat.players.batter.boxname}
          <br/>On deck: {this.props.onDeck.boxname}
          <br/>In the hole: {this.props.inHole.boxname}
        </h4>
      </div>
    ) 
    else result = (
      <div className='atbat'>
        <div onClick={() => this.props.showHideCard(this.props.index)}>
          <h4>{this.props.half}</h4>
          <p>{this.props.atBat.des} <strong>{this.props.atBat.home_team_runs}-{this.props.atBat.away_team_runs}</strong></p>
          <p>{this.props.atBat.b}-{this.props.atBat.s}, {this.props.atBat.o} out</p>
        </div>
        <div className={`pitches ${this.props.hidden ? 'hidden' : ''}`}>
          <div onClick={() => this.props.showHideCard(this.props.index)}>
            {chart}
          </div>
          {pitches}
        </div>
      </div>
    )
    return result
  }
}

export default AtBat