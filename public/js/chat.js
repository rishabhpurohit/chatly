const socket = io();

//Elements variables for using the form elements in the code. 
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');


// templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix:true});


const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on("message", (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username:message.username,
        message:message.text, // ,i.e., message:message
        createdAt:moment(message.createdAt).format("hh:mm a")
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});


socket.on("locationMessage", (message) => {
    console.log(message);
    const html = Mustache.render(locationTemplate, {
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format("hh:mm a") // ,i.e., message:message
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

// to show the list of active users
socket.on('roomData', ({room,users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

const msg = $messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    //disable the form
    $messageFormButton.setAttribute('disabled', 'disabled');


    //const message = document.querySelector('input').value;
    const message = e.target.elements.message.value;


    socket.emit("sendMessage", message, (error)=>{
        //enable the form again
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = "";
        $messageFormInput.focus();
        if(error){
            return console.log(error); // sending acknowledgement
        }
        console.log('The message was delivered!'); 
    });
  });




$sendLocationButton.addEventListener('click', () => {
    //disable the location button
    $sendLocationButton.setAttribute('disabled', 'disabled');
    
    if(!navigator.geolocation){
        return alert("Geolocation is not supported by your browser");
    }
    
    const location = navigator.geolocation.getCurrentPosition((position) => {
        //console.log(position);
        
        //enable the location button again
        $sendLocationButton.removeAttribute('disabled');


        socket.emit("sendLocation",{
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        }, ()=>{
            console.log("Location Shared!"); // after getting acknowledgement from the server we print the message to client.
        })
    });
})


socket.emit('join', {username,room}, (error) =>{
    if(error){
        alert(error)
        location.href = '/' // redirecting to send them to home page
    }
});



















//counter poll application
// socket.on('countUpdated', (count)=>{
//     console.log('the count has been updated!', count);
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked');
//     socket.emit('increment');
// })
