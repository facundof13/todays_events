const express = require('express');
const events = require('./events');

const app = express();
app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('public'));


app.get('/api/:timeleft',  (request, response) => {
  events.getAPIEvents(request.params.timeleft)
  .then(events => {
    response.send((events));
  })
});

module.exports = app;