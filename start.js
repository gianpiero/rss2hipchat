var wobot = require('wobot');
var prompt = require('prompt');




var argv = require('minimist')(process.argv.slice(2));
console.dir(argv);

var myjid    = argv.id;
var myroom   = argv.room;
var feed     = argv.feed;
var password = argv.password;

// If you don't want to use the cmd line you can specify your values here:

myjid; //"<PUT YOUR ID HERE>";
myroom; //"<PUT YOUR CHAT ID HERE>";
feed; //'<PUT YOUR RSS FEED HERE>';

prompt.start();


if (myjid == undefined) {
    console.error("You must specify your id! Either by command line (--id) or by editing the file")
    return;
}

if (myroom == undefined) {
    console.error("You must specify your room! Either by command line (--room) or by editing the file")
    return;
}

if (feed == undefined) {
    console.error("You must specify your feed! Either by command line (--feed) or by editing the file")
    return;
}

function job(err, result) {
  //console.log('Command-line input received:');
  //console.log('  password: ' + result.password);

  var bot = new wobot.Bot({
    jid: myjid,
    password: result.password
  });

  bot.connect();

  bot.onConnect(function() {
    console.log(' -=- > Connected');

    this.join(myroom);
    console.log(' -=- > Joined Room');
    runRSS(bot);
  });
}

if (password == undefined)  {
    prompt.get([{
          name: 'password',
          hidden: true,
          conform: function (value) {
            return true;
          }
        }],
    function (err, result) {
        job(err,result);
    });
} else {
    var result = {};
    result.password = password;
    job(null,result);
}

var Watcher = require('rss-watcher');
var watcher = new Watcher(feed);


watcher.set({
  feed: feed,
  interval: 5
});

function runRSS(bot) {
    watcher.run(function(err, articles) {
       if (err) {
         console.error(err);
       }
       return console.log(articles.length);
     });

     watcher.on('new article', function(article) {
         var today = new Date();
         var pubdate = new Date(article.pubdate);

         var message = '{Bot] New Post on the forum: "' + article.title +' click here to respond: ' + article.link;

         if (today.getFullYear() == pubdate.getFullYear() &&
             today.getMonth() == pubdate.getMonth() &&
             today.getDate() == pubdate.getDate() ) {
                //Is a today article
                console.log(" -=- > Sending: ");
                console.log(message);
                bot.message(myroom, message);
            } else {
                // Old message
                console.log("Posted on: " + pubdate.toDateString())
                console.log(message)
            }
     });

     watcher.on("error", function(error) {
       return console.error(error);
     });
}
