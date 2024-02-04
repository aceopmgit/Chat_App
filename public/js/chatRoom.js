//for adding chats
const chats = document.getElementById('chat');
chats.addEventListener('submit', addChats);

const token = localStorage.getItem('token');

const chatList = document.getElementById('chatList')
const joinList = document.getElementById('joinList')

//for showing all chats
const allChats = document.getElementById('allChats');
allChats.addEventListener('click', showAllChats);

//for scrolling
const scrollDown = document.getElementById('scrollDown');
scrollDown.addEventListener('click', scrollToBottom);

//for creating group
const groupForm = document.getElementById('groupForm');
let isSubmitting = false;
groupForm.addEventListener('submit', validateForm);


let groupid;

//code for the token
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

//code for scrolling down to bottom
function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);

}

// function showError(err) {
//     document.body.innerHTML =
//         document.body.innerHTML + `<h4 style="color: red;">${err.message}</h4>`;
//     console.log(err);
// }

//codes for adding chats to groups
async function addChats(e) {
    e.preventDefault();
    try {
        const message = document.getElementById('message').value;
        document.getElementById('message').value = ""
        document.getElementById('message').focus()


        showChats({ Chats: message, userName: parseJwt(token).name });
        window.scrollTo(0, document.body.scrollHeight);

        groupid = localStorage.getItem('groupId');
        const res = await axios.post(`/chatRoom/addChat?groupId=${groupid}`, {
            message: message
        }, { headers: { "Authorization": token } });



    } catch (err) {
        document.body.innerHTML =
            document.body.innerHTML + `<h4 style="color: red;">${err.message}</h4>`;
        console.log(err);
    }
}

//code for showing chats of group in frontend
function showChats(obj) {
    const message = obj.Chats;
    let name;
    //creating li element
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.style.border = 'none';
    li.style.width = 'fit-content';

    if (obj.userName === parseJwt(token).name) {
        name = 'You'
        li.style.backgroundColor = '#4fe94f'
    }
    else {
        name = obj.userName;
        li.style.backgroundColor = '#fdf5c9'
    }

    //creating first div to store chats
    const div1 = document.createElement('div');

    //creating second div to store username
    const div2 = document.createElement('div');
    div2.className = 'fw-bold';
    div2.appendChild(document.createTextNode(name));

    //Adding div2 to div1
    div1.appendChild(div2);

    //Adding chats to div1
    div1.appendChild(document.createTextNode(message));

    //Adding div1 to li
    li.appendChild(div1);

    //creating br element
    const br = document.createElement('br');

    chatList.append(li, br)
}

//getting chats of  a group on click of group button
async function showAllChats(e) {

    try {
        if (e === undefined) {
            groupid = localStorage.getItem('groupId');
        }
        else {
            groupid = e.target.value
            localStorage.setItem('groupId', e.target.value);
        }

        chatList.innerHTML = "";
        const res = await axios.get(`/chatRoom/getChats?groupId=${groupid}`, { headers: { "Authorization": token } });
        for (let i = 0; i < res.data.chats.length; i++) {
            showChats(res.data.chats[i]);

        }

        //removing older chats from local storage
        const chats = [...res.data.chats];
        while (chats.length > 10) {
            chats.shift();
        }
        localStorage.setItem('chats', JSON.stringify(chats));


        getUsersOfGroup()

    } catch (err) {
        document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

        console.log(err);
    }
}

//getting users in a group from backend
async function getUsersOfGroup() {
    try {
        groupid = localStorage.getItem('groupId')
        if (groupid === null) {
            groupid = 0
        }

        joinList.innerHTML = "";
        const res1 = await axios.get(`/chatRoom/showUsersOfGroup?groupId=${groupid}`, { headers: { "Authorization": token } });
        console.log(res1)
        console.log(res1.data.users[0].users.length)
        for (let i = 0; i < res1.data.users[0].users.length; i++) {
            showUsers(res1.data.users[0].users[i])
        }
    } catch (err) {
        document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

        console.log(err);
    }
}

//code for showing all users in a group on thefront end;
function showUsers(obj) {
    //creating li element
    const li = document.createElement('li');
    li.className = 'list-group-item mx-auto';
    li.style.backgroundColor = '#b9beb9';
    li.style.width = 'fit-content';
    li.appendChild(document.createTextNode(`${obj.Name} has joined`));

    const br = document.createElement('br');
    joinList.append(li, br);

}

window.addEventListener("DOMContentLoaded", async () => {

    //getting chats of user
    async function getChats() {
        try {
            if (localStorage.getItem('chats') === null) {
                groupid = localStorage.getItem('groupId')
                if (groupid === null) {
                    groupid = 0
                }
                console.log(groupid)

                const res = await axios.get(`/chatRoom/getChats?groupId=${groupid}`, { headers: { "Authorization": token } });

                //removing older chats from local storage
                const chats = [...res.data.chats];
                while (chats.length > 10) {
                    chats.shift();
                }
                localStorage.setItem('chats', JSON.stringify(chats));



                for (let i = 0; i < res.data.chats.length; i++) {
                    showChats(res.data.chats[i]);

                }
            }
            else {
                const oldChats = JSON.parse(localStorage.getItem('chats'))

                let newchatIndex = 0
                if (oldChats.length > 0 && oldChats != null) {
                    newchatIndex = oldChats[oldChats.length - 1].id
                }


                //showing new and old chats on reload
                for (let i = 0; i < oldChats.length; i++) {
                    showChats(oldChats[i]);

                }

            }

            let ID;
            setInterval(async function () {
                try {

                    //showing chats in real time
                    const oldChats = JSON.parse(localStorage.getItem('chats'))
                    groupid = localStorage.getItem('groupId')
                    if (groupid === null) {
                        groupid = 0
                    }

                    let newchatIndex = 0
                    if (oldChats.length > 0 && oldChats != null) {
                        newchatIndex = oldChats[oldChats.length - 1].id
                    }

                    const res = await axios.get(`/chatRoom/getChats?chatIndex=${newchatIndex}&groupId=${groupid}`, { headers: { "Authorization": token } });

                    //storing new chats to localstorage
                    for (let i = 0; i < res.data.chats.length; i++) {
                        oldChats.push(res.data.chats[i]);
                    }

                    //removing older chats from local storage
                    while (oldChats.length > 10) {
                        oldChats.shift();
                    }
                    localStorage.setItem('chats', JSON.stringify(oldChats));


                    //showing newchats every second
                    for (let i = 0; i < res.data.chats.length; i++) {

                        if (res.data.chats[i].userName != parseJwt(token).name && ID != res.data.chats[i].id) {
                            showChats(res.data.chats[i]);
                            ID = res.data.chats[i].id;
                            window.scrollTo(0, document.body.scrollHeight);

                        }

                    }






                } catch (err) {

                    document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

                    console.log(err);
                }

            }, 1000);


        } catch (err) {
            document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

            console.log(err);
        }


    }

    //getting user's group from backend
    async function getGroupsOnReload() {
        const res = await axios.get(`/group/getGroups`, { headers: { "Authorization": token } });
        if (res.data[0].groups.length) {
            document.getElementById('chatSection').style.visibility = 'visible'
        }
        console.log(res.data[0].groups.length);
        for (let i = 0; i < res.data[0].groups.length; i++) {
            showGroups(res.data[0].groups[i])
        }
    }

    //getting users for adding in a group;
    async function displayAllUsers() {
        try {


            const res = await axios.get(`/chatRoom/showUsers`, { headers: { "Authorization": token } });
            // console.log(res1)
            // console.log(res1.data.users[0].users.length)
            const userList = document.getElementById('membersList');
            for (let i = 0; i < res.data.users.length; i++) {

                //getting user list to show in create group modal

                const input = document.createElement('input');
                input.type = 'checkbox';
                input.name = 'users';
                input.value = res.data.users[i].id;
                const p = document.createElement('p');
                p.appendChild(input)
                p.appendChild(document.createTextNode(res.data.users[i].Name));
                userList.appendChild(p);

            }
        } catch (err) {
            document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

            console.log(err);
        }
    }


    getChats();
    getUsersOfGroup();
    displayAllUsers();
    getGroupsOnReload();


});


//For making selecting atleast one checkbox mandatory
function validateForm(event) {
    event.preventDefault(); // Prevent the form from submitting immediately

    if (isSubmitting) {
        return; // If already submitting, do nothing
    }

    let checkboxes = document.getElementsByName('users');
    let isChecked = false;

    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            isChecked = true;
            break;
        }
    }

    if (!isChecked) {
        document.getElementById('error-message').innerText = 'Please select at least one checkbox.';
    } else {
        document.getElementById('error-message').innerText = '';
        isSubmitting = true; // Set the flag before calling createGroup
        createGroup(event);
    }
}


//for creating groups
async function createGroup(e) {
    e.preventDefault();

    const groupName = document.getElementById('gname').value;
    const checkboxes = document.getElementsByName('users');
    const users = [];

    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            users.push(checkboxes[i].value);
        }
    }

    const details = {
        name: groupName,
        users: users
    }

    const createButton = e.target;
    createButton.disabled = true;

    try {
        const res = await axios.post(`/group/createGroup`, details, { headers: { "Authorization": token } });
        console.log(res.data);

        document.getElementById('groupModalClose').click();
        groupForm.reset();
        showGroups(res.data.details);

    } catch (error) {
        console.error('Error creating group:', error);
    } finally {
        isSubmitting = false; // Reset the flag after the Axios call
        createButton.disabled = false;
    }
}

function showGroups(obj) {
    const groupList = document.getElementById('groupList');

    const button = document.createElement('button');
    button.className = 'list-group-item list-group-item-action';
    button.setAttribute("data-bs-toggle", "list");
    button.addEventListener('click', showAllChats);
    button.innerHTML = obj.Name;
    button.value = obj.id;
    groupList.appendChild(button);

    document.getElementById('chatSection').style.visibility = 'visible'
    localStorage.setItem('groupId', obj.id);

}










