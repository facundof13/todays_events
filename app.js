const express = require('express');
const events = require('./events');

const app = express();
app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('public'));


app.get('/api',  (request, response) => {
  const todayEvents = events.main();
  response.json(todayEvents);

});

app.get('/test', (req, res) => {
  console.log('here');
})


module.exports = app;