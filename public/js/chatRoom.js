import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
const socket = io();


//for adding chats
const chats = document.getElementById('chat');
chats.addEventListener('submit', addChats);

const token = localStorage.getItem('token');

const chatList = document.getElementById('chatList')
const joinList = document.getElementById('joinList')


//for scrolling to bottom
document.getElementById('scrollDown').addEventListener('click', scrollToBottom);

//for creating group
const groupForm = document.getElementById('groupForm');
groupForm.addEventListener('submit', createGroup);

//for adding admin
const addAdminForm = document.getElementById('addAdminForm');
addAdminForm.addEventListener('submit', addAdmin);

//for removing users from group;
const removeUserForm = document.getElementById('removeUserForm');
removeUserForm.addEventListener('submit', removeUser);

//for adding users to an existing group
const addUserForm = document.getElementById('addUserForm');
addUserForm.addEventListener('submit', addUsers);

const deleteGroupButton = document.getElementById('deleteGroupButton');
deleteGroupButton.addEventListener('click', deleteGroup)

const leaveGroupButton = document.getElementById('leaveGroupButton');
leaveGroupButton.addEventListener('click', leaveGroup)



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
        const fileErrors = document.getElementById('fileErrors')
        fileErrors.innerHTML = '';

        const message = document.getElementById('message').value;
        document.getElementById('message').value = "";

        const files = document.getElementById('fileUpload').files

        if (message.trim() === '' && files.length === 0) {
            chats.reset()
            return
        }

        console.log(message)

        const formData = new FormData();
        if (files.length > 10) {
            const h5 = document.createElement('h5');
            h5.style.color = 'red'
            h5.innerHTML = 'You cannot send more than 10 files at once !'
            fileErrors.appendChild(h5);
            return
        }

        // Check file size and append to formData
        for (let i = 0; i < files.length; i++) {
            if (files[i].size <= 5 * 1024 * 1024) { // 5MB limit
                formData.append('files', files[i]);
            } else {
                const h5 = document.createElement('h5');
                h5.style.color = 'red'
                h5.innerHTML = `File ${files[i].name} exceeds the size limit (10MB) and won't be uploaded.`
                fileErrors.appendChild(h5);
            }
        }
        formData.append('text', message)

        chats.reset()
        groupid = localStorage.getItem('groupId');

        if (groupid) {

            const res = await axios.post(`/chatRoom/addChat?groupId=${groupid}`, formData, { headers: { "Authorization": token, 'Content-Type': 'multipart/form-data' } });

            // console.log(res.data)

            document.getElementById('message').focus()
            showChats(res.data.chatDetails);
            window.scrollTo(0, document.body.scrollHeight);

            let oldChats = JSON.parse(localStorage.getItem('chats'))
            oldChats.push(res.data.chatDetails)

            //removing older chats from local storage
            while (oldChats.length > 10) {
                oldChats.shift();
            }
            localStorage.setItem('chats', JSON.stringify(oldChats));

            // console.log(oldChats)

            socket.emit('send-message', res.data.chatDetails);
        }



    } catch (err) {
        document.body.innerHTML =
            document.body.innerHTML + `<h4 style="color: red;">Some error occured. Please refresh the page</h4>`;
        console.log(err);
    }
}

//code for showing chats of group in frontend
function showChats(obj) {
    // console.log(obj);
    if (obj.fileStatus === false) {
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
    else {
        const fileUrl = JSON.parse(obj.fileUrl);

        if (fileUrl[0].type.includes('image')) {
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

            const a = document.createElement('a');
            a.href = fileUrl[0].Url;

            const img = document.createElement('img');
            img.src = fileUrl[0].Url;
            img.width = 300;
            img.height = 200;

            a.appendChild(img);

            div1.appendChild(a);

            const chat = document.createElement('p');
            chat.innerHTML = `${message}`

            div1.appendChild(chat);

            //Adding div1 to li
            li.appendChild(div1);

            //creating br element
            const br = document.createElement('br');

            chatList.append(li, br)



        }
        else {
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

            const a = document.createElement('a');
            a.href = fileUrl[0].Url;
            a.download = fileUrl[0].name;

            a.appendChild(document.createTextNode(fileUrl[0].name))

            div1.appendChild(a);

            const chat = document.createElement('p');
            chat.innerHTML = `${message}`

            div1.appendChild(chat);

            //Adding div1 to li
            li.appendChild(div1);

            //creating br element
            const br = document.createElement('br');

            chatList.append(li, br)




        }

        // console.log(fileUrl)
    }

}

//getting chats of  a group on click of group button
async function showAllChats(e) {

    try {
        //       console.log(e.target);
        if (e.target.id === 'allChats') {

            groupid = localStorage.getItem('groupId');

            chatList.innerHTML = "";
            if (groupid) {
                const res = await axios.get(`/chatRoom/getAllChats?groupId=${groupid}`, { headers: { "Authorization": token } });

                if (res.data.chats.length > 0) {
                    for (let i = 0; i < res.data.chats.length; i++) {
                        showChats(res.data.chats[i]);

                    }


                    //removing older chats from local storage
                    const chats = [...res.data.chats];
                    while (chats.length > 10) {
                        chats.shift();
                    }
                    //console.log(chats);
                    localStorage.setItem('chats', JSON.stringify(chats));
                }
                else {
                    const res = await axios.get(`/chatRoom/getChats?groupId=${groupid}`, { headers: { "Authorization": token } });

                    if (res.data.chats.length > 0) {
                        for (let i = 0; i < res.data.chats.length; i++) {
                            showChats(res.data.chats[i]);

                        }


                        //removing older chats from local storage
                        const chats = [...res.data.chats];
                        while (chats.length > 10) {
                            chats.shift();
                        }
                        //console.log(chats);
                        localStorage.setItem('chats', JSON.stringify(chats));
                    }
                    else {
                        localStorage.setItem('chats', JSON.stringify([]));
                    }
                }
            }

        }
        else {
            groupid = e.target.id;
            localStorage.setItem('groupId', groupid);
            document.getElementById('chatSection').style.visibility = 'visible'

            showGroupInfo();
            permissons();

            chatList.innerHTML = "";
            if (groupid) {
                const res = await axios.get(`/chatRoom/getChats?groupId=${groupid}`, { headers: { "Authorization": token } });

                if (res.data.chats.length > 0) {
                    for (let i = 0; i < res.data.chats.length; i++) {
                        showChats(res.data.chats[i]);

                    }


                    //removing older chats from local storage
                    const chats = [...res.data.chats];
                    while (chats.length > 10) {
                        chats.shift();
                    }
                    //console.log(chats);
                    localStorage.setItem('chats', JSON.stringify(chats));
                }
                else {
                    localStorage.setItem('chats', JSON.stringify([]));
                }
            }

        }

    } catch (err) {
        document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

        console.log(err);
    }
}


window.addEventListener("DOMContentLoaded", async () => {

    if (!token) {
        window.location.href = "/user/login";
    }

    //getting chats of user
    async function getChats() {
        try {
            groupid = localStorage.getItem('groupId')


            if (groupid) {
                //checking group status
                const res = await axios.get(`/group/checkGroupStatus?groupId=${groupid}`, { headers: { "Authorization": token } });
                //console.log(res.data);
                if (res.data.success === false) {
                    localStorage.removeItem('groupId');
                    localStorage.removeItem('chats');
                }
                else {
                    const oldChats = JSON.parse(localStorage.getItem('chats'))

                    if (oldChats) {
                        for (let i = 0; i < oldChats.length; i++) {
                            showChats(oldChats[i]);
                        }
                    }
                }
            }
        } catch (err) {
            document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

            console.log(err);
        }


    }

    //getting user's group from backend
    async function getGroupsOnReload() {
        try {
            const res = await axios.get(`/group/getGroups`, { headers: { "Authorization": token } });

            //console.log(res.data[0].groups.length);
            for (let i = 0; i < res.data[0].groups.length; i++) {
                showGroups(res.data[0].groups[i])
            }

            if (localStorage.getItem('groupId') != null) {
                //console.log(localStorage.getItem('groupId'))
                const activeGroup = document.getElementById(localStorage.getItem('groupId'));
                activeGroup.className = 'list-group-item list-group-item-action active'
                document.getElementById('chatSection').style.visibility = 'visible'

            }

        } catch (err) {
            {
                document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

                console.log(err);
            }
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
    displayAllUsers();
    getGroupsOnReload();
    permissons();
    showGroupInfo();



});

//showing chats on realtime
socket.on("receive-message", (message) => {
    console.log(message);
    if (message.groupId == localStorage.getItem('groupId')) {
        showChats(message);
        let oldChats = JSON.parse(localStorage.getItem('chats'))
        oldChats.push(message)


        //removing older chats from local storage
        while (oldChats.length > 10) {
            oldChats.shift();
        }
        localStorage.setItem('chats', JSON.stringify(oldChats));
    }

})

//showing group to group user in real time
socket.on("show-group", (data, users) => {

    const userId = parseJwt(token).userId.toString();
    // console.log('group created', data, users, userId);
    // console.log(typeof userId)

    if (users.includes(userId)) {
        showGroups(data);

    }
    // console.log(users.includes(userId))

})

//deleting group in real time
socket.on("delete-group", (groupId) => {

    console.log(groupId);
    if (localStorage.getItem('groupId') === groupId) {
        localStorage.removeItem('groupId');
        localStorage.removeItem('chats');
        alert('This group has been deleted by group owner !');
        window.location.reload();
    }
    else {
        document.getElementById(groupId).remove();
    }

})




// for creating groups******************************************************

async function createGroup(event) {
    event.preventDefault(); // Prevent the form from submitting immediately

    document.getElementById('error-message').innerText = '';
    const groupName = document.getElementById('gname').value;
    const checkboxes = document.getElementsByName('users');
    const users = [];

    if (groupName.trim() === '') {
        document.getElementById('error-message').innerText = 'Please enter a group name';
        groupForm.reset();
        return;
    }

    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            users.push(checkboxes[i].value);
        }
    }

    if (users.length === 0) {
        document.getElementById('error-message').innerText = 'Please select at least one checkbox.';

    }
    else {
        const details = {
            name: groupName,
            users: users
        }

        try {
            const res = await axios.post(`/group/createGroup`, details, { headers: { "Authorization": token } });
            //console.log(res.data);

            document.getElementById('groupModalClose').click();
            groupForm.reset();
            showGroups(res.data.details);

            socket.emit('group-created', res.data.details, details.users);


        } catch (error) {
            console.error('Error creating group:', error);
        }


    }

}

function showGroups(obj) {
    const groupList = document.getElementById('groupList');

    const button = document.createElement('button');
    button.className = 'list-group-item list-group-item-action';
    button.setAttribute("data-bs-toggle", "list");
    button.addEventListener('click', showAllChats);
    button.innerHTML = obj.Name;
    button.id = obj.id;
    groupList.appendChild(button);

    // document.getElementById('chatSection').style.visibility = 'visible'

}

//-------------------------------------------------------------------------------



//For adding admin  of group *************************************************
async function showUsersForAddingAdmin() {
    try {
        const button = document.getElementById('addAdminButton')
        button.style.visibility = 'visible';

        groupid = localStorage.getItem('groupId');
        if (groupid === null) {
            groupid = 0
        }
        const res = await axios.get(`/admin/getUsers?groupId=${groupid}`, { headers: { "Authorization": token } });
        //console.log(res1.data);
        const userList = document.getElementById('addAdminList');
        userList.innerHTML = ""
        if (res.data.length > 0) {
            for (let i of res.data) {
                //getting user list to show in create group modal

                const input = document.createElement('input');
                input.type = 'checkbox';
                input.name = 'adminUsers';
                input.value = i.id;
                const p = document.createElement('p');
                p.appendChild(input)
                p.appendChild(document.createTextNode(i.Name));
                userList.appendChild(p);
            }
        }
        else {
            userList.innerHTML = userList.innerHTML + '<h4>No Users Found !</h4>';
            button.style.visibility = 'hidden';

        }
    } catch (err) {
        document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

        console.log(err);
    }
}

async function addAdmin(event) {
    event.preventDefault();
    const checkboxes = document.getElementsByName('adminUsers');
    const users = [];

    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            users.push(checkboxes[i].value);
        }
    }

    if (users.length === 0) {
        document.getElementById('error-message1').innerText = 'Please select at least one checkbox.';
    }
    else {
        const details = {
            users: users
        }

        groupid = localStorage.getItem('groupId');

        if (groupid != null) {
            try {
                const res = await axios.post(`/admin/addAdmin?groupId=${groupid}`, details, { headers: { "Authorization": token } });


                document.getElementById('addAdminModalClose').click();
                addAdminForm.reset();
                document.getElementById('error-message1').innerText = '';
                window.location.reload();

            } catch (error) {
                console.error('Error creating group:', error);
            }
        }

    }
}
//-------------------------------------------------------------------------------


//for removing users from group*************************************************
async function showUsersForRemovingFromGroup() {
    try {
        const button = document.getElementById('removeUserButton')
        button.style.visibility = 'visible';

        groupid = localStorage.getItem('groupId');
        if (groupid === null) {
            groupid = 0
        }
        const res = await axios.get(`/group/showUsersForRemoving?groupId=${groupid}`, { headers: { "Authorization": token } });
        //console.log(typeof (res.data));
        const userList = document.getElementById('removeUserList');
        userList.innerHTML = ""
        if (res.data.length > 0) {
            for (let i of res.data) {
                //getting user list to show in create group modal

                const input = document.createElement('input');
                input.type = 'checkbox';
                input.name = 'rUsers';
                input.value = i.id;
                const p = document.createElement('p');
                p.appendChild(input)
                p.appendChild(document.createTextNode(i.Name));
                userList.appendChild(p);
            }
        }
        else {
            userList.innerHTML = userList.innerHTML + '<h4>No Users Found !</h4>';
            button.style.visibility = 'hidden';

        }
    } catch (err) {
        document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

        console.log(err);
    }
}

async function removeUser(event) {
    event.preventDefault(); // Prevent the form from submitting immediately

    const checkboxes = document.getElementsByName('rUsers');
    const users = [];
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            users.push(checkboxes[i].value);
        }
    }

    if (users.length === 0) {
        document.getElementById('error-message2').innerText = 'Please select at least one checkbox.';
    }
    else {
        const details = {
            users: users
        }

        groupid = localStorage.getItem('groupId');

        if (groupid != null) {
            try {
                const res = await axios.post(`/group/removeUsers?groupId=${groupid}`, details, { headers: { "Authorization": token } });

                document.getElementById('removeUserModalClose').click();
                removeUserForm.reset();
                window.location.reload();
                document.getElementById('error-message2').innerText = '';

            } catch (error) {
                console.error('Error creating group:', error);
            }
        }

    }
}
//-------------------------------------------------------------------------------


//for adding users to an existing group******************************************
async function showUsersForAddingToGroup() {
    try {
        const button = document.getElementById('addUserButton')
        button.style.visibility = 'visible';

        groupid = localStorage.getItem('groupId');
        if (groupid === null) {
            groupid = 0
        }
        const res = await axios.get(`/group/showUsersForAdding?groupId=${groupid}`, { headers: { "Authorization": token } });
        //console.log(res.data);
        const userList = document.getElementById('addUserList');
        userList.innerHTML = ""
        if (res.data.length > 0) {
            for (let i of res.data) {
                //getting user list to show in create group modal

                const input = document.createElement('input');
                input.type = 'checkbox';
                input.name = 'addUsers';
                input.value = i.id;
                const p = document.createElement('p');
                p.appendChild(input)
                p.appendChild(document.createTextNode(i.name));
                userList.appendChild(p);
            }
        }
        else {
            userList.innerHTML = userList.innerHTML + '<h4>No Users Found !</h4>';
            button.style.visibility = 'hidden';

        }
    } catch (err) {
        document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

        console.log(err);
    }
}

async function addUsers(event) {
    event.preventDefault(); // Prevent the form from submitting immediately

    const checkboxes = document.getElementsByName('addUsers');
    const users = [];
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            users.push(checkboxes[i].value);
        }
    }

    if (users.length === 0) {
        document.getElementById('error-message3').innerText = 'Please select at least one checkbox.';
    }
    else {
        const details = {
            users: users
        }

        groupid = localStorage.getItem('groupId');

        if (groupid != null) {
            try {
                const res = await axios.post(`/group/addUsers?groupId=${groupid}`, details, { headers: { "Authorization": token } });
                console.log(res);
                document.getElementById('addUserModalClose').click();
                addUserForm.reset();
                window.location.reload();
                document.getElementById('error-message3').innerText = '';

            } catch (error) {
                console.error('Error creating group:', error);
            }
        }

    }
}

//--------------------------------------------------------------------------------

//for leaving group***************************************************************
async function leaveGroup() {
    try {
        const res = await axios.delete(`/group/leaveGroup?groupId=${groupid}`, { headers: { "Authorization": token } });
        localStorage.removeItem('groupId');
        localStorage.removeItem('chats');
        window.location.reload();


    } catch (err) {
        document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

        console.log(err);
    }
}
//---------------------------------------------------------------------------------

//for deleting group****************************************************************
async function deleteGroup() {
    try {
        let groupid = localStorage.getItem('groupId');
        const res = await axios.delete(`/group/deleteGroup?groupId=${groupid}`, { headers: { "Authorization": token } });
        localStorage.removeItem('groupId');
        localStorage.removeItem('chats');
        socket.emit('group-deleted', groupid);
        window.location.reload();



    } catch (err) {
        document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

        console.log(err);
    }
}
//----------------------------------------------------------------------------------

//for checking user's permission
async function permissons() {
    creatingDropdownButton();
    const groupid = localStorage.getItem('groupId');

    try {
        if (groupid) {
            //checking if the user is admin or not
            const res = await axios.get(`/group/checkAdmin?groupId=${groupid}`, { headers: { "Authorization": token } });
            //console.log(res.data);
            if (res.data.success === false) {
                document.getElementById('addAdmin').remove();
                document.getElementById('addMembers').remove();
                document.getElementById('removeMembers').remove();
                document.getElementById('deleteGroup').remove();

            }
            else {
                //checking  if the user is creator/owner of group
                const res = await axios.get(`/group/checkOwner?groupId=${groupid}`, { headers: { "Authorization": token } });
                //console.log(res.data);
                if (res.data.success === false) {
                    document.getElementById('addAdmin').remove();
                    document.getElementById('deleteGroup').remove();
                    showUsersForRemovingFromGroup()
                    showUsersForAddingToGroup()

                }
                else {
                    showUsersForAddingAdmin()
                    showUsersForRemovingFromGroup()
                    showUsersForAddingToGroup()
                }
            }
        };
    } catch (err) {
        document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

        console.log(err);
    }
}

function creatingDropdownButton() {
    const list = document.getElementById('dropdownMenu');
    list.innerHTML = '';

    //adding button for viewing all chats
    const li0 = document.createElement('li');
    const btn0 = document.createElement('button');
    btn0.className = 'dropdown-item';
    btn0.id = 'allChats';
    btn0.innerHTML = 'See all Chats';
    btn0.addEventListener('click', showAllChats);
    li0.appendChild(btn0);
    list.appendChild(li0);

    //Add admin button
    const li6 = document.createElement('li');
    const btn6 = document.createElement('button');
    btn6.className = 'dropdown-item';
    btn6.setAttribute('data-bs-toggle', 'modal');
    btn6.setAttribute('data-bs-target', '#groupInfoModal');
    btn6.id = 'groupInfo';
    btn6.innerHTML = 'Group Info';
    li6.appendChild(btn6);
    list.appendChild(li6);


    //Add admin button
    const li1 = document.createElement('li');
    const btn1 = document.createElement('button');
    btn1.className = 'dropdown-item';
    btn1.setAttribute('data-bs-toggle', 'modal');
    btn1.setAttribute('data-bs-target', '#addAdminModal');
    btn1.id = 'addAdmin';
    btn1.innerHTML = 'Add new admin';
    li1.appendChild(btn1);
    list.appendChild(li1);

    //Add button for adding users to an existing group
    const li2 = document.createElement('li');
    const btn2 = document.createElement('button');
    btn2.className = 'dropdown-item';
    btn2.setAttribute('data-bs-toggle', 'modal');
    btn2.setAttribute('data-bs-target', '#addUserModal');
    btn2.id = 'addMembers';
    btn2.innerHTML = 'Add members to the group';
    li2.appendChild(btn2);
    list.appendChild(li2);

    //Add button for removing users from an existing group
    const li3 = document.createElement('li');
    const btn3 = document.createElement('button');
    btn3.className = 'dropdown-item';
    btn3.setAttribute('data-bs-toggle', 'modal');
    btn3.setAttribute('data-bs-target', '#removeUserModal');
    btn3.id = 'removeMembers';
    btn3.innerHTML = 'Remove members of the group';
    li3.appendChild(btn3);
    list.appendChild(li3);

    //Add button for leaving the current group 
    const li4 = document.createElement('li');
    const btn4 = document.createElement('button');
    btn4.className = 'dropdown-item';
    btn4.setAttribute('data-bs-toggle', 'modal');
    btn4.setAttribute('data-bs-target', '#exitGroupModal');
    btn4.id = 'leaveGroup';
    btn4.innerHTML = 'Leave Group';
    li4.appendChild(btn4);
    list.appendChild(li4);

    //adding button for leaving the current group
    const li5 = document.createElement('li');
    const btn5 = document.createElement('button');
    btn5.className = 'dropdown-item';
    btn5.id = 'deleteGroup';
    btn5.setAttribute('data-bs-toggle', 'modal');
    btn5.setAttribute('data-bs-target', '#deleteGroupModal');
    btn5.innerHTML = 'Delete Group';
    li5.appendChild(btn5);
    list.appendChild(li5);
}

//for displaying groupinfo
async function showGroupInfo() {
    try {
        if (localStorage.getItem('groupId') != null) {
            // document.getElementById('groupInfoBody').innerHTML = "";
            groupid = localStorage.getItem('groupId');
            const res1 = await axios.get(`/group/showUsersOfGroup?groupId=${groupid}`, { headers: { "Authorization": token } });
            console.log(res1)
            console.log(res1.data.users[0].Name);
            // console.log(document.getElementById('groupInfoGroupName'))

            //Displaying group Name
            document.getElementById('groupInfoGroupName').innerHTML = `${res1.data.users[0].Name}`;

            //displaying Number of Members in the group
            document.getElementById('groupInfoMemberCount').innerHTML = `Group :${res1.data.users[0].users.length} members`;

            //for displaying members of group
            const memberList = document.getElementById('groupInfoMemberList');
            memberList.innerHTML = '';
            const a = document.createElement('h4');
            a.innerHTML = 'Group Members'
            memberList.append(a);

            for (let i = 0; i < res1.data.users[0].users.length; i++) {
                // showUsers(res1.data.users[0].users[i])
                if (parseJwt(token).name === res1.data.users[0].users[i].Name) {
                    const li = document.createElement('li');
                    li.className = 'list-group-item'
                    li.appendChild(document.createTextNode(`You`));
                    memberList.append(li);
                }
                else {
                    const li = document.createElement('li');
                    li.className = 'list-group-item'
                    li.appendChild(document.createTextNode(`${res1.data.users[0].users[i].Name}`));
                    memberList.append(li);
                }
            }

            //displaying Admins of group
            const adminList = document.getElementById('groupInfoadminList');
            adminList.innerHTML = '';
            const h4 = document.createElement('h4');
            h4.innerHTML = 'Group Admins'
            adminList.append(h4);

            const res2 = await axios.get(`/group/getGroupAdmins?groupId=${groupid}`, { headers: { "Authorization": token } });
            console.log(res2.data.admins);

            for (let i = 0; i < res2.data.admins.length; i++) {
                if (parseJwt(token).name === res2.data.admins[i]) {
                    const li = document.createElement('li');
                    li.className = 'list-group-item'
                    li.appendChild(document.createTextNode(`You`));
                    adminList.append(li);
                }
                else {
                    const li = document.createElement('li');
                    li.className = 'list-group-item'
                    li.appendChild(document.createTextNode(`${res2.data.admins[i]}`));
                    adminList.append(li);
                }

            }


            //console.log(res1.data.users[0].users.length)
            // for (let i = 0; i < res1.data.users[0].users.length; i++) {
            //     showUsers(res1.data.users[0].users[i])
            // }
        }
    } catch (err) {
        document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

        console.log(err);
    }
}






