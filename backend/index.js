const express = require('express'),
      app = express(),
      request = require('request'),
      bodyParser = require('body-parser'),
      xmlparser = require('xml2json'),
      probables = require('mlbprobablepitchers')

app.listen(8080, () => {
  console.log('listening on port 8080')
})

app.use(bodyParser.urlencoded({ extended: false}))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

function padDigit(n) {
  return n < 10 ? '0' + n : String(n)
}

const date = new Date(2017, 5, 5),
      baseMLBURL = 'http://gd2.mlb.com/components/game/mlb/',
      baseMLBURLToday = `http://gd2.mlb.com/components/game/mlb/year_${date.getFullYear()}/month_${padDigit(date.getMonth()+1)}/day_${padDigit(date.getDate())}/`

app.get('/', (req, res) => {
  resetGameData()
})

app.get('/games/:id', (req, res) => {
  resetGameData()
  gameID = req.params.id
  getRosters()
  getBoxscore()
  getAtBats()
  getLinescore(() => {
    stopGameIntervalID = setInterval(() => {
        getBoxscore(() => 
          getAtBats(() => 
            getLinescore(getBatter)))
      }, 5000)
  })
  res.json({success:true})
})

app.get('/updategame', (req, res) => {
  res.json({gameInfo, gameStatus, atBats, linescore, currBatter})
})

app.get('/preview/:id', (req, res) => {
  resetGameData()
  request(baseMLBURLToday + req.params.id + '/linescore.xml', (error, response, body) => {
    if (error) {
      console.log(error)
      return
    }
    try {
      res.json(JSON.parse(xmlparser.toJson(body)))
    } catch(err) {
      console.log(body.game)
    }
  })
})

app.get('/updatenavbar', (req, res) => {
  request(baseMLBURLToday +'miniscoreboard.json', (error, response, body) => {
    if (error) {
      console.log(error)
      return
    }
    res.send(JSON.parse(body).data.games.game)
  })
})

app.post('/stopserver', (req, res) => {
  resetGameData()
  res.json({success: 'stopped server'})
})

app.get('/gamesfordate/:datestring', (req, res) => {
  request(`${baseMLBURL}${req.params.datestring}/miniscoreboard.json`, (error, response, body) => {
    if (error) {
      console.log(error)
      return res.json([])
    }
    let games = []
    try{ 
      games = JSON.parse(body).data.games.game
    } catch (e) {
      console.log(e)
    }
    res.json(Array.isArray(games) ? games : [])
  })
})

let rosters = {
                home: [],
                away: []
              }
let gameInfo = {}
let gameStatus = 'P'
let gameID = ''
let stopGameIntervalID = null
let stopGameInterval = false
let atBats = {}
let linescore = {empty:true}
let currBatter = {empty:true}

function getRosters(callback) {
  baseURL = baseMLBURLToday + gameID
  request(baseURL + '/players.xml', (error, response, body) => {
    if (error) {
      console.log('request err from getRosters', error)
      if (callback) callback()
      return
    }
    try {
      let gameRosters = JSON.parse(xmlparser.toJson(body)).game.team
      rosters.away = gameRosters[0].player
      rosters.home  =  gameRosters[1].player
      if (callback) callback()
    } catch (err) {
      console.log(err)
      if (callback) callback()
      return
    }
  })
}

function getBoxscore(callback) {
  const baseURL = baseMLBURLToday +  gameID
  request(baseURL + '/boxscore.xml', (err, res, body) => {
    if (err) {
      console.log(err)
      if (callback) callback()
      return
    }
    try {
      gameInfo = JSON.parse(xmlparser.toJson(body)).boxscore
      if (callback) callback()
    } catch (err) {
      console.log(err)
      if (callback) callback()
    }
  })
}

function getAtBats(callback) {
  request(baseMLBURLToday + gameID + '/inning/inning_all.xml', (error, response, body) => {
    if (error) {
      console.log('getAtBats', error)
      if (callback) callback()
      return
    }
    try {
      atBats = JSON.parse(xmlparser.toJson(body)).game
      if (callback) callback()

    } catch(e) {
      console.log('getAtBats', e)
      if (callback) callback()
    }
  })
}

function getLinescore(callback) {
  request(baseMLBURLToday + gameID + '/linescore.xml', (error, response, body) => {
    if (error) {
      console.log(error)
      if (callback) callback()
      return
    }
    try {
      linescore = JSON.parse(xmlparser.toJson(body)).game
      gameStatus = linescore.status
      if (callback) callback()
    } catch(e) {
      console.log(e)
      if (callback) callback()
    }
  })
}

function getBatter(callback) {
  request(baseMLBURLToday + gameID + '/plays.json', (error, response, body) => {
    if (error) {
      console.log(error)
      if (callback) callback()
      return
    }
    try {
      currBatter = JSON.parse(body).data.game
      if (callback) callback()
    } catch (e) {
      console.log(e)
      currBatter = {empty: true}
      if (callback) callback()
    }
  })
}

function resetGameData() {
  clearInterval(stopGameIntervalID)
  rosters = {
              home: [],
              away: []
             }
  gameInfo = {empty:true}
  gameStatus = 'P'
  currentGameID = ''
  stopGameIntervalID = null
  stopGameInterval = false
  linescore = {empty:true}
  currBatter = {empty:true}
}