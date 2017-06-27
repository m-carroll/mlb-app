/**
 * NOTE: the object being passed to addToGamesObject() is not being modified. FIND OUT WHY.
 */

const express = require('express'),
      app = express(),
      // path = require('path'),
      request = require('request'),
      bodyParser = require('body-parser'),
      xmlparser = require('xml2json'),
      probables = require('mlbprobablepitchers')
      // PORT = process.env.PORT || 8888;

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

function ensureIsArray(arr) {
  if (!Array.isArray(arr)) {
    if (!Object.keys(arr).length) arr = []
    else arr = [arr]
  }
}

let selectedDate = new Date(),
    today = new Date(),
    baseMLBURL = 'http://gd2.mlb.com/components/game/mlb/',
    baseMLBURLToday = `${baseMLBURL}year_${today.getFullYear()}/month_${padDigit(today.getMonth()+1)}/day_${padDigit(today.getDate())}/`,
    baseMLBURLSelectedDay = baseMLBURLToday

let gameID = ''
//for indexing games objects for desired game info

let currBatter = {empty:true}
//only info not held in games objects, updated on the fly. Most dynamic info. May fold into games objects at some point, should be easy. Is higher temporal granularity.

let currentDaysMiniscoreboard = []
let selectedDaysMiniscoreboard = []
//for navbar and homepage, respectively. Not meant to populate react components, meant to be held in App or Home states.

let currentDaysGameIDs = []
let selectedDaysGameIDs = []
//at this point, mainly for building games objects. Could be useful for other purpose later? Worth keeping around.

let currentDaysGames = {}
let selectedDaysGames = {}
//contains info on all games for today and the selected day, respectively. Can be identical. Meant to hold all info for Game/App except currBatter. Subject to change.

let updateTodaysGames= true
//flag used in updategame endpoint to tell which games object to reference

app.get('/', (req, res) => {
  resetGameData()
  res.json({games: selectedDaysMiniscoreboard})
})

app.get('/updategame', (req, res) => {
  if (!gameID) return res.json({success: false})
  const games = updateTodaysGames ? currentDaysGames : selectedDaysGames
  res.json({
            gameStatus: games[gameID].status,
            boxscore: games[gameID].boxscore,
            linescore: games[gameID].linescore,
            innings: games[gameID].innings,
            currBatter: currBatter,
            gameID: gameID
          })
})

app.get('/games/today/:id', (req, res) => {
  gameID = req.params.id
  updateTodaysGames = true
  console.log(gameID)
  getBatter(baseMLBURLToday + gameID)
  const stopGameIntervalID = setInterval(() => {
    if (gameID !== req.params.id) {
      clearInterval(stopGameIntervalID)
      currBatter = {empty:true}
    }
    else getBatter(baseMLBURLToday + gameID)
  }, 5000)
  res.json({success: true})
})

app.get('/games/selectedday/:id', (req, res) => {
  gameID = req.params.id
  updateTodaysGames = false
  getBatter(baseMLBURLSelectedDay + gameID)
  const stopGameIntervalID = setInterval(() => {
    if (gameID !== req.params.id) {
      clearInterval(stopGameIntervalID)
      currBatter = {empty:true}
    }
    else getBatter(baseMLBURLSelectedDay + gameID)
  }, 5000)
  res.json({success:true})
})

app.get('/preview/today/:id', (req, res) => {
  gameID = req.params.id
  res.json({linescore: currentDaysGames[gameID].linescore})
})

app.get('/preview/selectedday/:id', (req, res) => {
  gameID = req.params.id
  res.json({linescore: selectedDaysGames[gameID].linescore})
})

app.get('/updatenavbar', (req, res) => {
  res.json(currentDaysMiniscoreboard)
})

app.get('/gamesfordate/:datestring', (req, res) => {
  /**
   * 1. Get all game IDs for given date
   * 2. Get each game's linescore.
   * 3. Check to see if Preview.
   * 4. If preview, end. Else, get innings and boxscore.
   * 5. Send back whole day's boxscore
   * 6. Start interval to refresh info for each game. 
   */
  console.log(req.params.datestring)
  let splitDate = req.params.datestring.split('-')
  selectedDate = new Date(splitDate[0], Number(splitDate[1])-1, splitDate[2])
  baseMLBURLSelectedDay = `${baseMLBURL}/year_${splitDate[0]}/month_${splitDate[1]}/day_${splitDate[2]}/`
  request(`${baseMLBURLSelectedDay}miniscoreboard.json`, (error, response, body) => {
    if (error) {
      console.log('error in gamesfordate', error)
      return res.json([])
    }
    let games = []
    try{ 
      games = JSON.parse(body).data.games.game
      ensureIsArray(games)
      selectedDaysGameIDs = games.map( x => {return 'gid_' + x.gameday_link})
      selectedDaysMiniscoreboard = games
      selectedDaysGameIDs.forEach( x => {
        addToGamesObject(baseMLBURLSelectedDay + x, x, selectedDaysGames)
      })
      const stopDayIntervalID = setInterval(() => {
        if (!selectedDaysGames.length) clearInterval(stopDayIntervalID)
        else selectedDaysGameIDs.forEach( x => addToGamesObject(baseMLBURLSelectedDay + x, x, selectedDaysGames))
      }, 10000)
    } catch (e) {
      console.log('error in gamesfordate', e)
    }
    res.json(selectedDaysMiniscoreboard)
  })
})

function addToGamesObject(url, id, object) {
  getLinescore(url, id, currentDaysGames, () => {
    getBoxscore(url, id, object, () => getInnings(url, id, object))
  })
}

function getBoxscore(url, id, object, callback) {
  request(url + '/boxscore.json', (error, response, body) => {
    if (error) {
      console.log('error from addGamesToObject, url "' + url + '" no good', error)
      if (callback) callback()
    } else {
      let boxscore = JSON.parse(body).data.boxscore
      if (id in object) object[id].boxscore = boxscore //Here assume that if id is in object, its value is an object, at least {}
      else object[id] = {boxscore}
      if (callback) callback()
    }
  })
}

function getInnings(url, id, object, callback) {
  request(url + '/inning/inning_all.xml', (error, response, body) => {
    if (error) {
      console.log('error in getInnings', error)
    } else {
      let innings = JSON.parse(xmlparser.toJson(body)).game
      if (id in object) object[id].innings = innings //Here assume that if id is in object, its value is an object, at least {}
      else object[id] = {innings}
      if (callback) callback()
    }
  })
}

function getLinescore(url, id, object, callback) {
  /**
   * As of now, the callback is always called with the game status. If purpose of linescore changes then we'll change that.
   */
  request(url + '/linescore.json', (error, response, body) => {
    if (error) {
      console.log('error in getLinescore', error)
      if (callback) callback()
      return
    }
    try {
      linescore = JSON.parse(body).data.game
      if (id in object) {
        object[id].status = linescore.status //Here assume that if id is in object, its value is an object, at least {}
        object[id].linescore = linescore
      }
      else object[id] = {status: linescore.status, linescore}
      if (linescore.status !== 'Preview' && callback) callback()
    } catch(e) {
      console.log('error in getLinescore', e)
      if (callback) callback()
    }
  })
}

function getBatter(url, callback) {
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
      currBatter = {empty: true}
      if (callback) callback()
    }
  })
}

function resetGameData() {
  gameID = ''
  currBatter = {empty:true}
}

request(`${baseMLBURLToday}miniscoreboard.json`, (error, response, body) => {
  if (error) {
    console.log('error getting todays games', error)
  }
  let games = []
  try{ 
    games = JSON.parse(body).data.games.game
    ensureIsArray(games)
    currentDaysGameIDs = games.map( x => {return 'gid_' + x.gameday_link})
    currentDaysMiniscoreboard = games
    currentDaysGameIDs.forEach( x => {
      addToGamesObject(baseMLBURLToday + x, x, currentDaysGames)
    })
    setInterval(() => {
      currentDaysGameIDs.forEach( x => addToGamesObject(baseMLBURLToday + x, x, currentDaysGames))
    }, 10000)
  } catch (e) {
    console.log('error getting todays games', e)
  }
})

app.listen(8080, () => {
    console.log('Server running on:' + 8080);
    console.log('Kill server with CTRL + C');
});
