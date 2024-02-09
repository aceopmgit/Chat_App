const login = document.getElementById("login");
login.addEventListener("submit", submitUser);


function submitUser(e) {
  e.preventDefault();

  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  const details = {
    Email: email,
    Password: password,
  };

  async function loginCheck() {
    try {
      const res = await axios.post(
        `/user/loginCheck`,
        details
      );
      alert(res.data.message);
      localStorage.setItem("token", res.data.token);
      localStorage.removeItem('groupId');
      localStorage.removeItem('newChatIndex');
      localStorage.removeItem('chats');
      window.location.href = "/chatRoom/enterChatRoom";



      //document.getElementById("email").value = "";
      //document.getElementById("password").value = "";
    } catch (err) {
      document.body.innerHTML =
        document.body.innerHTML + `<h4 style="color: red;">${err.message}</h4>`;
      console.log(err);
    }
  }

  loginCheck();
}



