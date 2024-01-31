
const chats = document.getElementById('chat');
chats.addEventListener('submit', addChats);
const token = localStorage.getItem('token');
const chatList = document.getElementById('chatList')
const joinList = document.getElementById('joinList')

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
// function showError(err) {
//     document.body.innerHTML =
//         document.body.innerHTML + `<h4 style="color: red;">${err.message}</h4>`;
//     console.log(err);
// }

async function addChats(e) {
    e.preventDefault();
    try {
        const message = document.getElementById('message').value;
        document.getElementById('message').value = ""
        document.getElementById('message').focus()


        showChats({ Chats: message, userName: parseJwt(token).name });
        window.scrollTo(0, document.body.scrollHeight);


        const res = await axios.post('/ChatterBox/chatRoom/addChat', {
            message: message
        }, { headers: { "Authorization": token } });



    } catch (err) {
        document.body.innerHTML =
            document.body.innerHTML + `<h4 style="color: red;">${err.message}</h4>`;
        console.log(err);
    }
}

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

window.addEventListener("DOMContentLoaded", () => {

    async function dispalyUsers() {
        try {
            const res1 = await axios.get('/ChatterBox/chatRoom/showUsers', { headers: { "Authorization": token } });
            //console.log(res.data.users[0].Name)
            let userIndex = res1.data.users.length;
            for (let i = 0; i < res1.data.users.length; i++) {
                showUsers(res1.data.users[i])

            }
        } catch (err) {
            document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

            console.log(err);
        }
    }


    async function displayChats() {
        try {
            if (localStorage.getItem('chats') === null) {
                const res = await axios.get(`/ChatterBox/chatRoom/getChats`, { headers: { "Authorization": token } });
                localStorage.setItem('chats', JSON.stringify(res.data.chats));



                for (let i = 0; i < res.data.chats.length; i++) {
                    showChats(res.data.chats[i]);

                }
            }
            else {
                const oldChats = JSON.parse(localStorage.getItem('chats'))
                const res = await axios.get(`/ChatterBox/chatRoom/getChats?chatIndex=${oldChats[oldChats.length - 1].id}`, { headers: { "Authorization": token } });

                //storing new chats to localstorage
                for (let i = 0; i < res.data.chats.length; i++) {
                    oldChats.push(res.data.chats[i]);
                }
                localStorage.setItem('chats', JSON.stringify(oldChats));


                //showing new and old chats on reload
                for (let i = 0; i < oldChats.length; i++) {
                    showChats(oldChats[i]);

                }


            }

        } catch (err) {
            document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

            console.log(err);
        }


    }


    displayChats();
    dispalyUsers();


});



setInterval(async function () {
    try {

        //showing chats in real time
        const oldChats = JSON.parse(localStorage.getItem('chats'))
        console.log(oldChats[oldChats.length - 1].id)
        const res = await axios.get(`/ChatterBox/chatRoom/getChats?chatIndex=${oldChats[oldChats.length - 1].id}`, { headers: { "Authorization": token } });
        console.log(res.data.chats.length)
        //showing newchats every second
        for (let i = 0; i < res.data.chats.length; i++) {
            console.log('***************')
            if (res.data.chats[i].userName != parseJwt(token).name) {
                showChats(res.data.chats[i]);
            }

        }

        //storing new chats to localstorage
        for (let i = 0; i < res.data.chats.length; i++) {
            oldChats.push(res.data.chats[i]);
        }
        localStorage.setItem('chats', JSON.stringify(oldChats));





    } catch (err) {

        document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

        console.log(err);
    }

}, 3000);






