const users = [];

// add user
const addUser = ({id, username, room}) =>{
    //Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // if they are empty, or not (validatig the data)
    if(!username || !room){
        return {
            error:'username and room are required!'
        }
    }
    // name is unique for a room (Check for existing user)

    const existingUser = users.find((user) =>{
        return user.room === room && user.username === username
    })

    // Validate username
    if(existingUser){
        return {
            error:'Username is already taken for this room!'
        }
    }

    //store user in users array
    const user = {id, username, room}
    users.push(user)
    return {user};

}


// remove user
const removeUser = (id) =>{
    const index = users.findIndex((user) => user.id === id);

    if(index!=-1){
        return users.splice(index, 1)[0]; // we get an array and take its first element
    }
}


// get user
const getUser = (id) => {
    return users.find((user) => user.id === id);

}


// gets users in room
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room===room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}