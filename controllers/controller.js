var request = require('request')

// Splash
exports.renderPhase_1 = (req, res) => {
  res.render('index')
}

// Account
exports.renderPhase_2 = (req, res) => {
  res.render('index')
}

// Dashboard
exports.renderPhase_3 = async function (req, res) {
  //res.render('dashboard')
  await main().then((data) => {
    res.render('dashboard', {
      demo: data,
    })
  })
}

// Run for console output
for (let i = 0; i < 10; i++) {
  console.log('')
}

const api_request = (url) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      request(url, (err, response, body) => {
        if (!err && response.statusCode < 400) {
          resolve(JSON.parse(body))
        }
      })
    }, 1)
  })
}

// main()
async function main() {
  var categories = {
    fps: ['730'],
    //fps: ['730', '440', '578080', '218620', '444090', '272060', '1172470', '1229490', '552520', '1085660', '359550', '252490', '550', '230410'],
  }

  var data = []

  for (let i = 0; i < categories.fps.length; i++) {
    var urls = {
      steamPowered_url:
        'https://store.steampowered.com/api/appdetails?appids=' + categories.fps[i] + '&cc=gb&l=en&format=json',
      steamSpy_url: 'https://steamspy.com/api.php?request=appdetails&appid=' + categories.fps[i],
    }

    var powObjInit = await api_request(urls.steamPowered_url)
    var powObj = powObjInit[Object.keys(powObjInit)]['data']
    var spyObj = await api_request(urls.steamSpy_url)

    var obj = {
      app_id: spyObj.appid,
      name: spyObj.name,
      developer: spyObj.developer,
      publisher: spyObj.publisher,
      languages: spyObj.languages,
      header_image: String(powObj['header_image']),
      background: powObj['background'],
      release_date: powObj['release_date']['date'],
      coming_soon: powObj['release_date']['coming_soon'],
      price: check_if_free(powObj),
      screenshots: get_game_images(powObj),
      short_desc: strip_html(powObj['short_description']),
      long_desc: strip_html(powObj['detailed_description']),
      about_desc: strip_html(powObj['about_the_game']),
      website: powObj['website'],
      score: {
        positive: spyObj.positive,
        negative: spyObj.negative,
      },
      movies: {
        name: powObj['movies'][0]['name'],
        mp4: powObj['movies'][0]['mp4'].max,
      },
      support_info: {
        url: powObj['support_info'].url,
        email: powObj['support_info'].email,
      },
      requirements: {
        pc_req: {
          minimum: strip_html(check_exists(powObj['pc_requirements'].minimum)),
          recommended: strip_html(check_exists(powObj['pc_requirements'].recommended)),
        },
        mac_req: {
          minimum: strip_html(check_exists(powObj['mac_requirements'].minimum)),
          recommended: strip_html(check_exists(powObj['mac_requirements'].recommended)),
        },
      },
    }
    console.log(obj)
    data.push(obj)
  }

  //console.debug(data);
  return data
}

// Check if property exists test another fukcing test
function check_exists(property) {
  if (typeof property == 'undefined') {
    return 'NULL'
  } else {
    return property
  }
}

// Get game tags: Top 3 only
function get_game_tags(obj) {
  var arr = []
  var limit = 6
  for (var i = 0; i < limit; i++) {
    arr.push(obj[i])
  }
  return arr
}

// Get game images. Thumbnail & Full
function get_game_images(obj) {
  var arr = []
  for (value in obj['screenshots']) {
    var x = {
      thumbnail: obj['screenshots'][value]['path_thumbnail'],
      full: obj['screenshots'][value]['path_full'],
    }
    arr.push(x)
  }
  return arr
}

// Get game requirements
function get_game_req(obj) {
  var x = {
    recommended: check_if_exists(obj['recommended']) ? strip_html(obj['recommended']) : 'NULL',
    minimum: check_if_exists(obj['minimum']) ? strip_html(obj['minimum']) : 'NULL',
  }
  return x
}

function check_if_free(obj) {
  if (obj['is_free'] == true) {
    return (obj = {
      is_free: 'Free',
    })
  } else {
    return {
      currency: obj['price_overview'].currency,
      initial: obj['price_overview'].initial,
      final: obj['price_overview'].final,
      discount_percent: obj['price_overview'].discount_percent,
    }
  }
}

// Strip HTML tags from string
function strip_html(obj) {
  obj = obj.replace(/(<([^>]+)>)/gi, '')
  obj = obj.replace(/\t/g, ' ')
  obj = obj.replace(/\s{2,}/g, ' ').trim()
  return obj // I dont understand regex
}
