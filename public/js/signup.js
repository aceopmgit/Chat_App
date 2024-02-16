const signup = document.getElementById("signup");
signup.addEventListener("submit", submitUser);



async function submitUser(e) {
  try {

    e.preventDefault();

    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById('phone').value;
    let password = document.getElementById("password").value;

    const details = {
      Name: name,
      Email: email,
      Phone: phone,
      Password: password,
    };


    const res = await axios.post(
      `/user/addUser`,
      details
    );

    alert(res.data.message);
    window.location.href = "/user/login";

  } catch (err) {
    if (err.response.status === 409) {
      alert(err.response.data.message);
    }
    else {

      document.body.innerHTML =
        document.body.innerHTML + `<h4 style="color: red;">${err}</h4>`;
      console.log(err);
    }
  }
}
