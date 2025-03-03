function get_user_info() {
    const URL = "http://127.0.0.1:8000/profile/get";
    let token = sessionStorage.getItem("token");

    fetch(URL,
        {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "token": token,
            },
        })
        .then((response) => response.text())
        .then((text) => JSON.parse(text))
        .then((json) => {
            document.getElementById("user_name_field").innerHTML = json.user_name;
            document.getElementById("played_games").innerHTML = json.played_games;
        })
        .catch((error) => console.log(error));	
    
}

get_user_info();