const fs = require('fs');
const readline = require('readline');
const {
  google
} = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'token.json';

// getAPIEvents(25).then(events => {
//   console.log(events);
// })

async function getAPIEvents(midnightTonight) {
  return new Promise((resolve, reject) => {
    fs.readFile('./bin/credentials.json', async (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      authorize(JSON.parse(content), async (auth) => {
        const calendars = await getCalendarsAndFilter(auth);
        const events = await getEvents(auth, calendars, midnightTonight);
        resolve(events);
      });
    });
  })
}


async function authorize(credentials, callback) {
  const {
    client_secret,
    client_id,
    redirect_uris
  } = credentials.installed;
  const oAuth2Client = await new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, async (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    await oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

async function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'online',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, async (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      await oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}


async function getCalendarsAndFilter(auth) {
  const calendar = google.calendar({
    version: 'v3',
    auth
  });
  let allCalendars = [];
  const result = await calendar.calendarList.list();
  for (let i = 0; i < result.data.items.length; i++) {
    if ((result.data.items[i].summary.indexOf("Contact") < 0)) {
      if ((result.data.items[i].summary.indexOf("Holiday") < 0)) {
        allCalendars.push(result.data.items[i]);
      }
    }
  }
  return allCalendars;
}

async function getEvents(auth, calendars, midnightTonight) {
  let todayEvents = [];
  const calendar = await google.calendar({
    version: 'v3',
    auth
  });
  for (let i = 0; i < calendars.length; i++) {
    const result = await calendar.events.list({
      calendarId: calendars[i].id,
      timeMin: (new Date()).toISOString(),
      timeMax: midnightTonight,
      orderBy: 'startTime',
      singleEvents: true
    });
    const events = await result.data.items;
    for (let j = 0; j < events.length; j++) {
      todayEvents.unshift(calendars[i].summary + ": " + events[j].summary);
    }
  }
  return todayEvents;
}

module.exports = {
  getAPIEvents: getAPIEvents
}