const express = require('express');
const events = require('./events');

const app = express();
app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('public'));


app.get('/api', (request, response) => {
  events.getAPIEvents(25)
  .then(result => {
    response.json(result);
  });

});

app.get('/test', (req, res) => {
  console.log('here');
})


module.exports = app;