const express = require('express'),
      app = express(),
      path = require('path'),
      request = require('request'),
      bodyParser = require('body-parser'),
      xmlparser = require('xml2json'),
      probables = require('mlbprobablepitchers'),
      PORT = process.env.PORT || 8888;

app.use(bodyParser.urlencoded({ extended: false}))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})
// app.use(express.static(__dirname + './../frontend/build'))

function padDigit(n) {
  return n < 10 ? '0' + n : String(n)
}

const baseMLBURL = 'http://gd2.mlb.com/components/game/mlb/'

app.get('/', (req, res) => {
  res.json({'success':true})
})

app.get('localhost:8080/games/:id', (req, res) => {
  const splitDate = req.params.id.split('_').splice(1, 3)
  const url = `${baseMLBURL}/year_${splitDate[0]}/month_${splitDate[1]}/day_${splitDate[2]}/${req.params.id}`

  let linescore = {empty: true},
      boxscore = {
                  linescore: {inning_line_score:[]},
                  home_team_code: '',
                  away_team_code: '',
                  batting: [{batter:[]}, {batter:[]}],
                  pitching: [{pitcher:[]},{pitcher:[]}]
                },
      atBats = {empty: true},
      currBatter = {empty: true},
      gameID = req.params.id

  function getLinescore(callback) {
    request(url + '/linescore.xml', (error, response, body) => {
      if (error) {
        console.log('error in getLinescore', error)
        if (callback) callback()
        return
      }
      try {
        linescore = JSON.parse(xmlparser.toJson(body)).game
        if (callback) callback()
      } catch(e) {
        console.log('error in getLinescore', e)
      }
    })
  }

  function getBoxscore(callback) {
    request(url + '/boxscore.xml', (err, res, body) => {
      if (err) {
        console.log('error in getBoxscore', err)
        if (callback) callback()
        return
      }
      try {
        boxscore = JSON.parse(xmlparser.toJson(body)).boxscore
        if (callback) callback()
      } catch (err) {
        console.log('error in getBoxscore', err)
      }
    })
  }

  function getAtBats(callback) {
    request(url + '/inning/inning_all.xml', (error, response, body) => {
      if (error) {
        console.log('error in getAtBats', error)
        if (callback) callback()
        return
      }
      try {
        atBats = JSON.parse(xmlparser.toJson(body)).game
        if (callback) callback()
      } catch(e) {
        console.log('error in getAtBats', e)
      }
    })
  }

  function getBatter(callback) {
    request(url + '/plays.json', (error, response, body) => {
      if (error) {
        console.log('error in getBatter', error)
        if (callback) callback()
        return
      }
      try {
        currBatter = JSON.parse(body).data
        if (callback) callback()
      } catch (e) {
        console.log('error in getBatter', e)
      }
    })
  }

  getLinescore(() => {
    if (linescore.status === 'Preview') res.json({boxscore, atBats, currBatter, linescore})
    else 
    getBoxscore(() => {
      getAtBats(() => {
        getBatter(() => {
          res.json({boxscore, atBats, currBatter, linescore})
        })
      })
    })
  })
})

app.get('/updatenavbar', (req, res) => {
  const date = new Date(),
        baseMLBURLToday = `${baseMLBURL}/year_${date.getFullYear()}/month_${padDigit(date.getMonth()+1)}/day_${padDigit(date.getDate())}/`
  request(baseMLBURLToday +'miniscoreboard.json', (error, response, body) => {
    if (error) {
      console.log('error in updatenavbar', error)
      return
    }
    console.log(body)
    res.json(JSON.parse(body).data.games.game)
  })
})

app.get('/gamesfordate/:datestring', (req, res) => {
  const splitDate = req.params.datestring.split('_')
  date = new Date(splitDate[0], Number(splitDate[1])-1, splitDate[2])
  const reqURL = `${baseMLBURL}/year_${date.getFullYear()}/month_${padDigit(date.getMonth()+1)}/day_${padDigit(date.getDate())}/`
  request(`${reqURL}miniscoreboard.json`, (error, response, body) => {
    if (error) {
      console.log('error in gamesfordate', error)
      return res.json([])
    }
    let games = []
    try{ 
      games = JSON.parse(body).data.games.game
    } catch (e) {
      console.log('error in gamesfordate', e)
    }
    res.json(Array.isArray(games) ? games : [])
  })
})

// app.get('*', function (req, res) {
//     res.sendFile(path.resolve((__dirname + './../frontend/build/index.html')));
// });

app.listen(8080, () => {
    console.log('Server running on: 8080');
    console.log('Kill server with CTRL + C');
});

// app.listen(PORT, () => {
//     console.log('Server running on:' + PORT);
//     console.log('Kill server with CTRL + C');
// });