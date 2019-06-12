let tonightAtMidnight = new Date();
tonightAtMidnight.setHours(24,0,0,0);
tonightAtMidnight = tonightAtMidnight.toISOString();

const options = { "Content-Type": "application/json" }
fetch(`/api/${tonightAtMidnight}`, options)
.then(async response => {
 const events = await response.json();
 for (let i = 0; i < events.length; i++) {
   let para = document.createElement("p");
    let node = document.createTextNode(events[i]);
    para.appendChild(node);

    let mainDiv = document.getElementById("eventsPlaceholder");
    mainDiv.appendChild(para);
 }
});