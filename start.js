var wobot = require('wobot');
var prompt = require('prompt');

var myjid = "<PUT YOUR ID HERE>";
var myroom = "<PUT YOUR CHAT ID HERE>";
var feed = '<PUT YOUR RSS FEED HERE>';


prompt.start();

prompt.get([{
      name: 'password',
      hidden: true,
      conform: function (value) {
        return true;
      }
    }],
    function (err, result) {
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
);

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
                bot.message('164033_mct@conf.hipchat.com', message);
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
