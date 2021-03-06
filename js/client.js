/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;

/*

Trello Data Access

The following methods show all allowed fields, you only need to include those you want.
They all return promises that resolve to an object with the requested fields.

Get information about the current board
t.board('id', 'name', 'url', 'shortLink', 'members')

Get information about the current list (only available when a specific list is in context)
So for example available inside 'attachment-sections' or 'card-badges' but not 'show-settings' or 'board-buttons'
t.list('id', 'name', 'cards')

Get information about all open lists on the current board
t.lists('id', 'name', 'cards')

Get information about the current card (only available when a specific card is in context)
So for example available inside 'attachment-sections' or 'card-badges' but not 'show-settings' or 'board-buttons'
t.card('id', 'name', 'desc', 'due', 'closed', 'cover', 'attachments', 'members', 'labels', 'url', 'shortLink', 'idList')

Get information about all open cards on the current board
t.cards('id', 'name', 'desc', 'due', 'closed', 'cover', 'attachments', 'members', 'labels', 'url', 'shortLink', 'idList')

Get information about the current active Trello member
t.member('id', 'fullName', 'username')

For access to the rest of Trello's data, you'll need to use the RESTful API. This will require you to ask the
user to authorize your Power-Up to access Trello on their behalf. We've included an example of how to
do this in the `🔑 Authorization Capabilities 🗝` section at the bottom.

*/

/*

Storing/Retrieving Your Own Data

Your Power-Up is afforded 4096 chars of space per scope/visibility
The following methods return Promises.

Storing data follows the format: t.set('scope', 'visibility', 'key', 'value')
With the scopes, you can only store data at the 'card' scope when a card is in scope
So for example in the context of 'card-badges' or 'attachment-sections', but not 'board-badges' or 'show-settings'
Also keep in mind storing at the 'organization' scope will only work if the active user is a member of the team

Information that is private to the current user, such as tokens should be stored using 'private' at the 'member' scope

t.set('organization', 'private', 'key', 'value');
t.set('board', 'private', 'key', 'value');
t.set('card', 'private', 'key', 'value');
t.set('member', 'private', 'key', 'value');

Information that should be available to all users of the Power-Up should be stored as 'shared'

t.set('organization', 'shared', 'key', 'value');
t.set('board', 'shared', 'key', 'value');
t.set('card', 'shared', 'key', 'value');
t.set('member', 'shared', 'key', 'value');

If you want to set multiple keys at once you can do that like so

t.set('board', 'shared', { key: value, extra: extraValue });

Reading back your data is as simple as

t.get('organization', 'shared', 'key');

Or want all in scope data at once?

t.getAll();

*/

//const BASE_URL = './'
const BASE_URL = './'

const RES = BASE_URL + 'public/'
const VIEWS = BASE_URL + 'views/'
//const BASE_URL = '../'

var GLITCH_ICON = RES + 'images/glitch.svg';
var WHITE_ICON = RES + 'images/icon-white.svg';
var GRAY_ICON = RES + 'images/icon-gray.svg';




var randomBadgeColor = function() {
  return ['green', 'yellow', 'red', 'none'][Math.floor(Math.random() * 4)];
};

var getBadges = function(t, isDetailed){
  return Promise.all([t.card('name').get('name'), t.get('card', 'shared', 'effort_hours'), t.card('due'),])
  .spread(function(cardName, hours, due){
    //console.log(moment.utc(due.due))



    let result = [];

    if (isDetailed || hours) {
      if (hours == undefined) hours = 0;
      result.push(
        {
          title: 'Hours effort', 
          text: hours + ' h',
          icon: GRAY_ICON, 
          callback: function(context) { // function to run on click
            return context.popup({
              title: 'Hours effort settings',
              //url: BASE_URL + 'views/effort_hours.html',
              //url: BASE_URL + 'numeric' + '?description=' + 'Expected number of hours' + '&key=effort_hours',
              url: VIEWS + 'numeric_form.html' ,//+ '?description=' + 'Expected number of hours' + '&key=effort_hours',
              height: 184 // we can always resize later, but if we know the size in advance, its good to tell Trello
            });
          }
        }
        )
    }

    result.push(
      {
        title: 'Related cards', 
            text: 'related',
            icon: GRAY_ICON, 
            callback: function(context) { // function to run on click
              return context.popup({
                title: 'Add related card',
                items: t.cards('id'),
                search: {
                  count: 5, // How many items to display at a time
                  placeholder: 'Board cards',
                  empty: 'No cards found'
                }
              });
            }
      }
    )
    
    
    return result;
  })
};

function workingHoursBetweenDates(startDate, endDate, dayStart, dayEnd, includeWeekends) {  
    // Store minutes worked
    var minutesWorked = 0;

    // Validate input
    if (endDate < startDate) { return 0; }

    // Loop from your Start to End dates (by hour)
    var current = startDate;

    // Define work range
    var workHoursStart = dayStart;
    var workHoursEnd = dayEnd;

    // Loop while currentDate is less than end Date (by minutes)
    while(current <= endDate){      
        // Store the current time (with minutes adjusted)
        var currentTime = current.getHours() + (current.getMinutes() / 60);

        // Is the current time within a work day (and if it
        // occurs on a weekend or not)                   
        if(currentTime >= workHoursStart && currentTime < workHoursEnd && (includeWeekends ? current.getDay() !== 0 && current.getDay() !== 6 : true)){
              minutesWorked++;
        }

        // Increment current time
        current.setTime(current.getTime() + 1000 * 60);
    }

    // Return the number of hours
    return (minutesWorked / 60).toFixed(2);
}

var boardButtonCallback = function(t){  
  return t.modal({            
    url: BASE_URL + 'settings', // The URL to load for the iframe
    accentColor: '#ffffff', // Optional color for the modal header 
    height: 500, // Initial height for iframe; not used if fullscreen is true
    fullscreen: false, // Whether the modal should stretch to take up the whole screen
    //callback: () => console.log('Goodbye.'), // optional function called if user closes modal (via `X` or escape)
    title: 'Настройки плагина', // Optional title for modal header
    
  })        
};

  // we could provide a standard iframe popup, but in this case we
  // will let Trello do the heavy lifting
  return t.popup({
    title: 'Popup Search Example',
    items: items, // Trello will search client-side based on the text property of the items
    search: {
      count: 5, // How many items to display at a time
      placeholder: 'Search National Parks',
      empty: 'No parks found'
    }
  });
  
  // in the above case we let Trello do the searching client side
  // but what if we don't have all the information up front?
  // no worries, instead of giving Trello an array of `items` you can give it a function instead
  /*
  return t.popup({
    title: 'Popup Async Search',
    items: function(t, options) {
      // use options.search which is the search text entered so far
      // and return a Promise that resolves to an array of items
      // similar to the items you provided in the client side version above
    },
    search: {
      placeholder: 'Start typing your search',
      empty: 'Huh, nothing there',
      searching: 'Scouring the internet...'
    }
  });
  */

// We need to call initialize to get all of our capability handles set up and registered with Trello
TrelloPowerUp.initialize({
  // NOTE about asynchronous responses
  // If you need to make an asynchronous request or action before you can reply to Trello
  // you can return a Promise (bluebird promises are included at TrelloPowerUp.Promise)
  // The Promise should resolve to the object type that is expected to be returned
  'attachment-sections': function(t, options){
    
    var claimed = options.entries.filter(function(attachment){
      return attachment.url.indexOf('https://trello.com/c/') === 0;
    });

    if(claimed && claimed.length > 0){
      return [{
        id: 'RelatedCards', // optional if you aren't using a function for the title
        claimed: claimed,
        icon: GLITCH_ICON,
        title: 'Related cards',
        content: {
          type: 'iframe',
          //url: BASE_URL + 'section.html',

          url: t.signUrl(VIEWS + 'section.html'),
          height: 230
        }
      }];
    } else {
      return [];
    }
  },

  'list-sorters': function (t) {
    return t.list('name', 'id')
    .then(function (list) {
      return [{
        text: "Card Name",
        callback: function (t, opts) {
          console.log(opts.cards)
          var sortedCards = opts.cards.sort(
            function(a,b) {
              if (a.name > b.name) {
                return 1;
              } else if (b.name > a.name) {
                return -1;
              }
              return 0;
            });
          
          return {
            sortedIds: sortedCards.map(function (c) { return c.id; })
          };
        }
      }, {
        text: "Randomize",
        callback: function (t, opts) {
          var sortedCards = opts.cards.sort(
            function(a,b) {
              return Math.floor(Math.random() * 4 - 1); 
            });
          
          return {
            sortedIds: sortedCards.map(function (c) { return c.id; })
          };
        }
      }];
    });
  },
  
  'board-buttons': function(t, options){
    return [{
      icon: WHITE_ICON,
      text: 'Task Prioritizer',
      callback: boardButtonCallback
    }];
  },
  'card-badges': function(t, options){
    return getBadges(t, false);
  },
  
  'card-detail-badges': function(t, options) {
    return getBadges(t, true);
  },
  
});

console.log('Loaded by: ' + document.referrer);