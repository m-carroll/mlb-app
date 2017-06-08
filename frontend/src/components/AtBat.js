import React, { Component } from 'react'
import '../styles/game.css'
import {XYPlot, XAxis, YAxis, HorizontalGridLines, MarkSeries, LineMarkSeries, Hint} from 'react-vis'
import PitchDetails from'./PitchDetails'

class AtBat extends Component {
  constructor() {
    super()
    this.expandPitchData = this.expandPitchData.bind(this)
    this.state = {
      pitchesShowing: [],
      value: null
    }
    this.setValue = this.setValue.bind(this)
    this.clearValue = this.clearValue.bind(this)
    this.expandPitchData = this.expandPitchData.bind(this)
  }

  setValue(value) {
    this.setState({
      value:value.pitchNum
    })
  }

  clearValue() {
    this.setState({
      value: null
    })
  }
  expandPitchData(index) {
    let showing = this.state.pitchesShowing.concat()
    let showingLength = this.props.pitches.length
    for (var i=showing.length-1||0; i < showingLength; i++) {
      showing.push(false)
    }
    showing[index] = !showing[index]
    this.setState({
      pitchesShowing: showing
    })
  }

  // maxDim(arr, dim) {
  //   return Math.floor((arr.reduce((last, curr) => {return curr[dim] > last ? curr[dim] : last}, 0) +50)*100)/100
  // }

  // minDim(arr, dim) {
  //   return Math.floor((arr.reduce((last, curr) => {return curr[dim] < last ? curr[dim] : last}, 3000) -50)*100)/100
  // }

  render() {
    let value = this.state.value
    let pitchArray = this.props.pitches
    let atBatData = pitchArray.map( (x, i) => {
      let xcoord = Math.floor(x.x*100)/100
      let ycoord = Math.floor(x.y*100)/100
      return {x:xcoord, y:ycoord, type: x.type, des: x.des, pitchNum:i+1}
    })
    const calledStrikes = atBatData.filter(x => {return x.des === 'Called Strike'}),
          swingingStrikes = atBatData.filter(x => {return x.des === 'Swinging Strike' || x.des === 'Foul' || x.des === 'Foul Tip'}),
          balls = atBatData.filter(x => {return x.type === 'B'}),
          inPlay = atBatData.filter(x => {return x.type === 'X'})

    // const minY = this.minDim(pitchArray, 'y'),
    //       maxY = this.maxDim(pitchArray, 'y'),
    //       minX = this.minDim(pitchArray, 'x'),
    //       maxX = this.maxDim(pitchArray, 'x')

    // let borderPoints = [
    //                       {x:minX, y:minY}, 
    //                       {x:maxX, y:maxY}, 
    //                       {x:minX, y:maxY}, 
    //                       {x:maxX, y:minY}
    //                     ]
    let pitches = pitchArray.map((x, i) => {
      return <PitchDetails key={i} 
                           pitchNum={i+1} x={x} 
                           showing={this.state.pitchesShowing[i]} 
                           expand={(event) => this.expandPitchData(i)} 
                           isColorful={i+1 === value}/>
    })
    const chart = <XYPlot
                    width={200}
                    height={200}>
                    {/*<XAxis/>
                    <YAxis/>*/}
                    <MarkSeries
                      data={calledStrikes}
                      color='red'
                      size={10}
                      onValueMouseOver={this.setValue}
                      onValueMouseOut={this.clearValue}
                      />
                    <MarkSeries
                      data={swingingStrikes}
                      color='red'
                      size={10}
                      onValueMouseOver={this.setValue}
                      onValueMouseOut={this.clearValue}
                      />
                    <MarkSeries
                      data={balls}
                      color='lime'
                      size={10}
                      onValueMouseOver={this.setValue}
                      onValueMouseOut={this.clearValue}
                      />
                    <MarkSeries
                      data={inPlay}
                      color='blue'
                      size={10}
                      onValueMouseOver={this.setValue}
                      onValueMouseOut={this.clearValue}
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
          <div style={{padding:'50px'}}>
            {chart}
          </div>
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
          <p>{this.props.atBat.des} <strong>{this.props.atBat.home_team_runs}-{this.props.atBat.away_team_runs}</strong></p>
          <p>{this.props.atBat.b}-{this.props.atBat.s}, {this.props.atBat.o} out</p>
        </div>
        <div className={`pitches ${this.props.hidden ? 'hidden' : ''}`}>
          <div onClick={() => this.props.showHideCard(this.props.index)} style={{padding:'50px'}}>
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