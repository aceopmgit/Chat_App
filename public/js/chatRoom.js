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

window.addEventListener("DOMContentLoaded", async () => {
    try {

        const res1 = await axios.get('/ChatterBox/chatRoom/showUsers', { headers: { "Authorization": token } });
        //console.log(res.data.users[0].Name)
        let userIndex = res1.data.users.length;
        for (let i = 0; i < res1.data.users.length; i++) {
            showUsers(res1.data.users[i])

        }



        const res = await axios.get(`/ChatterBox/chatRoom/getChats`, { headers: { "Authorization": token } });

        let chatIndex = res.data.chats.length;
        for (let i = 0; i < res.data.chats.length; i++) {
            //console.log(res.data.allExpenseDetails[i])
            showChats(res.data.chats[i]);

        }


        setInterval(async function () {
            try {

                const res1 = await axios.get('/ChatterBox/chatRoom/showUsers', { headers: { "Authorization": token } });
                for (let i = userIndex; i < res1.data.users.length; i++) {
                    showUsers(res1.data.users[i])
                }
                userIndex = res1.data.users.length;


                const res = await axios.get(`/ChatterBox/chatRoom/getChats`, { headers: { "Authorization": token } });
                for (let i = chatIndex; i < res.data.chats.length; i++) {
                    //console.log(res.data.allExpenseDetails[i])
                    if (res.data.chats[i].userName != parseJwt(token).name) {
                        showChats(res.data.chats[i]);
                    }
                }
                chatIndex = res.data.chats.length;




            } catch (err) {
                document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

                console.log(err);
            }
        }, 1000);

    } catch (err) {
        document.body.innerHTML = document.body.innerHTML + '<h4 style="color: red;">Could not show Details</h4>';

        console.log(err);
    }
});


