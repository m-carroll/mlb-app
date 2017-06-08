import React, { Component } from 'react'
import '../styles/game.css'

class Lineup extends Component {
  render() {
    let b = this.props.batters
    const lineup = this.props.batters
                    .concat({name_display_first_last:'TOTAL:', ab:b.ab, h:b.h, r:b.r, rbi:b.rbi, bb:b.bb, so:b.so, lob:b.lob, avg:b.avg, obp:b.obp})
                    .map( (x, i) => {
                      return (
                        <tr key={i} className='lineup-player'>
                          <td>{x.name_display_first_last} <strong>{x.pos}</strong></td>
                          <td>{x.ab}</td>
                          <td>{x.r}</td>
                          <td>{x.h}</td>
                          <td>{x.rbi}</td>
                          <td>{x.bb}</td>
                          <td>{x.so}</td>
                          <td>{x.lob}</td>
                          <td>{x.avg}</td>
                          <td>{x.obp}</td>
                        </tr>
                      )
                    })
    let pitchers = Array.isArray(this.props.pitchers.pitcher) ? this.props.pitchers.pitcher : [this.props.pitchers.pitcher]
    let p = this.props.pitchers
    pitchers = pitchers
                .concat({name_display_first_last:'TOTAL:', out:p.out, h:p.h, r:p.r, er:p.er, bb:p.bb, so:p.so, hr:p.hr, era:p.era, pos:'P'})
                .filter((x, i) => {
                  return x.pos === 'P'
                }).map( (x, i) => {
                  return (
                    <tr key={i} className='pitcher-player'>
                      <td>{x.name_display_first_last} </td>
                      <td>{(x.out - x.out % 3)/3}.{x.out%3}</td>
                      <td>{x.h}</td>
                      <td>{x.r}</td>
                      <td>{x.er}</td>
                      <td>{x.bb}</td>
                      <td>{x.so}</td>
                      <td>{x.hr}</td>
                      <td>{x.era}</td>
                    </tr>
                  )
              })
    return(
      <table className='lineup'>
        <thead>
          <tr>{['BATTING', 'AB', 'R', 'H', 'RBI', 'BB', 'SO', 'LOB', 'AVG', 'OBP'].map((x, i) => {return <th key={i}>{x}</th>})}</tr>
        </thead>
        <tbody>
          {lineup}
        </tbody>
        <thead>
          <tr>{['PITCHING', 'IP', 'H', 'R', 'ER', 'BB', 'SO', 'HR', 'ERA'].map((x, i) => {return <th key={i}>{x}</th>})}</tr>
        </thead>
        <tbody>
          {pitchers}
        </tbody>
      </table>
    )
  }
}

export default Lineup