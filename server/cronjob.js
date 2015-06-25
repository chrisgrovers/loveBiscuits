var basicScraper = require('./controllers/basicScraperController');
var getExternalUrl = require('./controllers/urlController').getExternalUrl;
var CronJob = require('cron').CronJob;
var secret = require('../config.js');
var db = require('./db.js');
var Sequelize = require('sequelize');
var mandrill = require('mandrill-api');
mandrill_client = new mandrill.Mandrill(secret.mandrill.client_id);

// To run the cronjob as it is now: navigate to server dir and type node cronjob
// for every five minutes
// var schedule = '* +' */5 * * * *';


// for faster testing
// var schedule = '*/30 * * * * *';
var schedule = '*/5 * * * * *';

//To run every 3 seconds do */3; every 5 min do * */5 *

var cronjob = new CronJob(schedule, function() {
  console.log('You will see this message every 5 min');
  // check database for jobs assigned for cronjob

  // get urls 
  db.User.findAll()
    .then(function(allUsers) {
      for (var i = 0; i < allUsers.length; i++){
        var currEmail = allUsers[i].email;
        allUsers[i].getUrls()
          .then(function(url) {
            // display html that are changed
            for (var i = 0; i < url.length; i++) {
              getExternalUrl(url[i], function(newImage, url) {
                if (url) {
                  // the old image value that is stored
                  var oldImage = url.UserUrl.cropImage;

                  // Compare images here
                  // if (!(oldHtml === newHtml)) {
                  //   console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
                  //   console.log('there is a change at', url.url,'!')

                  //   // send email
                  //   // sendEmail(currEmail, currEmail);


                  //   // update html value in database


                  // }
                }
              });
              
            }
          })
      }
    })

}, null, true, 'America/Los_Angeles');

var sendEmail = function (email, name){
  var message = {
    "html": "<span>The Scrapinit found a change in the webpage you are following</span>",
    "subject": "We scraped some tubular stuff for you!!",
    "from_email": email,
    "from_name": "The Blank Arrays",
    "to": [{
      "email": email,
      "name":  name,
      "type": "to"
    },
    ],
    "headers": {
      "Reply-To": ""
    },
    "important": true,
  };

var async = false;
//send email // uncomment to send an email
mandrill_client.messages.send({"message": message, "async": async}, function(result) {
  console.log('Sent a message to '+ email+'  '+ result);
}, function(e) {
            // Mandrill returns the error as an object with name and message keys
            console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
            // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
  });
}