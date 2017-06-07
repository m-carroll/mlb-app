import React, { Component } from 'react'
import '../styles/game.css'

class PitchDetails extends Component {
  render() {
    const type = {"FF": 'four-seam fastball', "FC": 'cut fastball', "CU": 'curveball', "FT": 'two-seam fastball', "KN":'knuckleball', "EP":'eephus',
                  "SL": 'slider', "KC": 'knuckle-curve', "CH": 'changup', "SI":'sinker', "SF":'splitter', "FA":'fastball', "CB":'curveball', "FS":'sinker' }
    const x = this.props.x
    return (
      <p className='btn btn-default pitch-info' onClick={this.props.expand}>
        <span>{this.props.pitchNum}: {x.des}</span>
        <span className={this.props.showing ? '' : 'hidden'}>
          <br/>Type: {type[x.pitch_type] ||'??'}
          <br/>Start speed: {x.start_speed} mph
          <br/>End speed: {x.end_speed} mph
          <br/>Nasty rating: {x.nasty}
        </span>
      </p>
    )
  }
}

export default PitchDetails