const express = require('express');
const app = express(); 
const path = require('path');
const bodyParser = require('body-parser')
var connectLiveReload = require("connect-livereload")

var publicDirectory = __dirname + '/public'

// Front-End LiveReload.
var livereload = require("livereload")
var liveReloadServer = livereload.createServer()
liveReloadServer.watch(publicDirectory)
liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
        liveReloadServer.refresh("/")
    }, 10);
})

app.use(express.urlencoded({ extended: true }))

const mustache = require('mustache-express');
app.engine('mustache', mustache());
app.set('view engine', 'mustache');

app.set('views', __dirname + '/public/views');
app.use(express.static(publicDirectory));

app.use(connectLiveReload())

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Content-Type', 'text/html')
    next();
});

const routes = require('./routes/route.js');
app.use("/", routes);


const PORT = process.env.PORT || 8080
app.listen(PORT, function() {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
})




// Controller

const api_request = (url) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            request(url, (err, response, body) => {
                if(!err && response.statusCode < 400) {
                    resolve(JSON.parse(body));
                }
            })
        }, 1);
    });
}

//main();
async function main() { 
    console.clear();
    var categories = {
        fps: ['730', '440', '578080', '218620', '444090', '272060', '1172470', '1229490', '552520', '1085660', '359550', '252490', '550', '230410'],
    }
    
    var data = [];
    
    for (let i = 0; i < categories.fps.length; i++) {
        var urls = {
            steamPowered_url: 'https://store.steampowered.com/api/appdetails?appids=' + categories.fps[i] + '&cc=gb&l=en&format=json',
            steamSpy_url: 'https://steamspy.com/api.php?request=appdetails&appid=' + categories.fps[i]
        }

        var powObjInit = await api_request(urls.steamPowered_url);
        var powObj = powObjInit[Object.keys(powObjInit)]['data'];
        var spyObj = await api_request(urls.steamSpy_url);

        pc_rec_obj = get_game_req(powObj['pc_requirements']);
        mac_rec_obj = get_game_req(powObj['mac_requirements'])

        //console.log(categories.fps[i])
        console.log(urls.steamPowered_url)
        
        var obj = {
            // spyObj
            app_id: spyObj.appid,
            name: spyObj.name,
            tags: get_game_tags(Object.keys(spyObj.tags)),
            score: {
                positive: spyObj.positive, 
                negative: spyObj.negative
            },
            developer: spyObj.developer,
            publisher: spyObj.publisher,
            languages: spyObj.languages,
            // powObj
            release_date: powObj['release_date']['date'],
            coming_soon: powObj['release_date']['coming_soon'],
            price: check_if_free(powObj),
            header_image: powObj['header_image'],
            background: powObj['background'],
            screenshots: get_game_images(powObj),
            movies: check_if_exists(powObj) ? {
                name: check_if_exists(powObj['movies'][0]['name']) ? powObj['movies'][0]['name'] : "NULL",
                mp4: check_if_exists(powObj['movies'][0]['mp4'].max) ? powObj['movies'][0]['mp4'].max : "NULL"
            } : "NULL",
            website: powObj['website'],
            support_info: {
                url: powObj["support_info"].url,
                email: powObj["support_info"].email
            },
            short_desc: strip_html(powObj['short_description']), 
            long_desc: strip_html(powObj['detailed_description']),
            about_desc: strip_html(powObj['about_the_game']),
            requirements: {
                pc_req: {
                    minimum: pc_rec_obj.minimum,
                    recommended: pc_rec_obj.recommended
                },
                mac_req: {
                    minimum: mac_rec_obj.minimum,
                    recommended: mac_rec_obj.recommended
                }
            }
        }
        data.push(obj);
    }
    
    //console.log(data)
    return data
}

// Get game tags: Top 3 only
function get_game_tags(obj) { 
    var arr = [];
    var limit = 6;
    for (var i = 0; i < limit; i++) { arr.push(obj[i]) }
    return arr;
}

// Get game images. Thumbnail & Full
function get_game_images(obj) {
    var arr = []
    for(value in obj['screenshots']) {
        var x = {
            thumbnail: obj['screenshots'][value]['path_thumbnail'],
            full: obj['screenshots'][value]['path_full']
        }
        arr.push(x);
    }
    return arr;
}

// Get game requirements
function get_game_req(obj) {
    var x = {
        recommended: check_if_exists(obj['recommended']) ? strip_html(obj['recommended']) : "NULL",
        minimum: check_if_exists(obj['minimum']) ? strip_html(obj['minimum']) : "NULL",
    }
    return x;
}

function check_if_free(obj) { 
    if (obj['is_free'] == true) {
        return obj = {
            is_free: true
        }
    } else {
        return obj = {
            currency: obj['price_overview'].currency,
            initial: obj['price_overview'].initial,
            final: obj['price_overview'].final,
            discount_percent: obj['price_overview'].discount_percent
        }
    }
}

function check_if_exists(obj) {
    if (typeof obj == "undefined") {
        return ""
    } else {
        return obj
    }
}

// Strip HTML tags from string
function strip_html(obj) { 
    obj = obj.replace(/(<([^>]+)>)/gi, "")
    obj = obj.replace(/\t/g, ' ');
    obj = obj.replace(/\s{2,}/g,' ').trim()
    return obj; // I dont understand regex
}


