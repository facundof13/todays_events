const fs = require('fs');
const readline = require('readline');
const {
  google
} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'token.json';
let authToken;

fs.readFile('./bin/credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), setAuthToken);
});

function authorize(credentials, callback) {
  const {
    client_secret,
    client_id,
    redirect_uris
  } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}


// *******************
// 
//  
async function setAuthToken(oAuth2Client) {
  authToken = oAuth2Client;
  const cals = await getCalendarsAndFilter(authToken);
  const events = await getEvents(authToken, cals);
  return events;
}
// 
// 
// **********************

function getAccessToken(oAuth2Client, callback) {
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
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
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
  await result.data.items.forEach(function (cal) {
    if ((cal.summary.indexOf("Contact") < 0)) {
      if ((cal.summary.indexOf("Holiday") < 0)) {
        5
        allCalendars.push(cal);
      }
    }
  });
  return allCalendars;
}

async function getEvents(auth, calendars) {
  let todayEvents = [];
  const calendar = google.calendar({
    version: 'v3',
    auth
  });
  calendars.forEach(async function (cal) {
    let date = new Date();
    date.setTime(date.getTime() + (25 * 60 * 60 * 1000)); //search 25 hrs from now
    date.toISOString();
    const result = await calendar.events.list({
      calendarId: cal.id,
      timeMin: (new Date()).toISOString(),
      timeMax: date,
      orderBy: 'startTime',
      singleEvents: true
    });
    const events = await result.data.items;
    events.forEach(function (event) {
      todayEvents.push(cal.summary + ": " + event.summary);
    });
  });
  return todayEvents;
}