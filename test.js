const fs = require('fs');
const readline = require('readline');
const {
    google
} = require('googleapis');

// ***** GOOGLE CALENDAR API *****
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('./bin/credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Calendar API.
    authorize(JSON.parse(content), getAllCalendars);
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

function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
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

function getAllCalendars(auth) {
    const gcal = google.calendar({
        version: 'v3',
        auth
    });
    gcal.calendarList.list({
        auth
    }, function (err, userCalendarList) {
        if (err) console.log(err)
        else filterCalendars(userCalendarList.data.items, gcal)
    });
}

function filterCalendars(calendars, gcal) {
    let filteredCalendars = [];
    calendars.forEach(function (cal) {
        if ((cal.summary.indexOf("Contact") < 0)) {
            if ((cal.summary.indexOf("Holiday") < 0)) {
                filteredCalendars.push(cal);
            }
        }
    });
    getAllEvents(filteredCalendars, gcal);
}

function getAllEvents(calendars, gcal) {
    let todayEvents = [];
    calendars.forEach(function (cal) {
        let date = new Date();
        date.setTime(date.getTime() + (25 * 60 * 60 * 1000));
        date.toISOString();
        gcal.events.list({
            calendarId: cal.id,
            timeMin: (new Date()).toISOString(),
            timeMax: date,
            orderBy: 'startTime',
            singleEvents: true
        }, function (err, response) {
            if (err) console.log(err)
            else events = response.data.items;
            events.forEach(function (event) {
                todayEvents.push(cal.summary + ': ' + event.summary);
            });
        })
    });
    finished(todayEvents);
}

function finished(result) {
    setTimeout(() => {
        console.log(result);
    }, 500);
}