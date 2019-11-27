const express = require("express");
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path.resolve(__dirname, "config", "token.json");

const routes = express.Router();


routes.get("/", (req, res) => {
    return res.render("index.ejs");
});

routes.post("/", (req, res) => {
    const { title, location, description, startTime, finishTime, startDate, finishDate, students } = req.body;

    function createEvent(auth) {

        const calendar = google.calendar({ version: 'v3', auth });

        var event = {
            'summary': title,
            'location': location,
            'description': description,
            'start': {
                'dateTime': `${startDate}T${startTime}:00-03:00`,//'2019-11-11T19:00:00-03:00',
                'timeZone': 'America/Fortaleza',
            },
            'end': {
                'dateTime': `${finishDate}T${finishTime}:00-03:00`,
                'timeZone': 'America/Fortaleza',
            },
            'recurrence': [
                'RRULE:FREQ=DAILY;COUNT=2'
            ],
            'attendees': students.split(',').map(email => {return { email }}),
            'reminders': {
                'useDefault': 'useDefault',
                'overrides': [
                    { 'method': 'email', 'minutes': 24 * 60 },
                ],
            },
        };

        calendar.events.insert({
            auth: auth,
            calendarId: 'primary',
            resource: event,
        }, function (err, event) {
            if (err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                return;
            }
            console.log('Event created: %s', event);
        });

    }

    function authorize(credentials, callback) {

        const { client_secret, client_id, redirect_uris } = credentials.installed;

        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return getAccessToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        });
    }

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

                // console.log(token);
                oAuth2Client.setCredentials(token);

                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {

                    if (err) return console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                });

                callback(oAuth2Client);

            });
        });
    }

    fs.readFile(path.resolve(__dirname, 'config', 'credentials.json'), (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), createEvent);
    });


    return res.render("index.ejs");

});

module.exports = routes;