// imports always go first - if we're importing anything

const socket = io();

function setUserId(packet) {
    //debugger;
    console.log(packet);
}

function showDisconnectMessage(){
    console.log('a user disconnected');
}

socket.addEventListener('connected', setUserId);
socket.addEventListener('disconnect', showDisconnectMessage)
