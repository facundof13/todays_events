console.log('fetching');
const options = { "Content-Type": "application/json" }
fetch('/api', options)
.then(function(response) {
  console.log(response);
});