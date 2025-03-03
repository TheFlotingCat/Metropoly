
/**

 * Redirects user to certain page. If no page is given, it will redirect user to home page (/).

 *

 * @param {string} to - Path to the page.

 *

 * @example

 * redirection("/quiz") //redirects to quiz page

 */
function redirection(to = "/") {
    window.location.replace(to);
}


/**

 * Returns text in HTML element by its ID

 *

 * @param {string} id - Element's ID

 *

 * @example

 * get_text_by_id("quiz") //returns text of element with ID "quiz"

 */
function get_text_by_id(id) {
    let value = document.getElementById(id).value;
    if (value === "") {
        return null;
    }
    return value;
}


/**

 * Adds text to HTML element by its ID.

 *

 * @param {string} id - Element's ID.
 * @param {string} text - Text to add into element.

 *

 * @example

 * add_text_element_on_page("hi", "hello_field") //adds "hi" into element with "hello_field" ID

 */
function add_text_element_on_page(text, id) {
    let element = document.createTextNode(text);
    let space_for_element = document.getElementById(id);

    space_for_element.appendChild(element);
}


/**

 * Fully clears HTML element by ID.

 *

 * @param {string} field_id - Element's ID.

 *

 * @example

 * clear_field("field_to_clear") //deletes all elements in element with "field_to_clear" ID

 */
function clear_field(field_id) {
    let field = document.getElementById(field_id);
    field.innerHTML = "";
}


/**

 * Signs in user to website.

 */
function signin() {
    clear_field("error_message");

    let username = get_text_by_id("login");
    let password = get_text_by_id("password");

    if (username === null) {
        clear_field("error_message");
        add_text_element_on_page("Username is required", "error_message");
        return null
    } else if (password === null) {
        clear_field("error_message");
        add_text_element_on_page("Password is required", "error_message");
        return null
    }

    fetch("/signin/check", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
            username: username,
            password: password,
        })
    })
        .then(response => response.json())
        .then(json => {
            if (json === null) {
                return;
            }

            if (json["present"] === 0) {
                add_text_element_on_page("User with this username doesn't exist, sign up firstly", "error_message");
            } else if (json["password"] === 0) {
                add_text_element_on_page("Wrong password", "error_message");
            } else {
                sessionStorage.setItem("token", json["token"]);
                sessionStorage.setItem("name", username);
                redirection();
            }
        })
        .catch(error => console.error(error));
}


/**

 * Signs up user to website

 */
function signup() {
    clear_field("error_message");

    let username = get_text_by_id("login");
    let password = get_text_by_id("password");
    let password_check = get_text_by_id("password_check")


    if (username === null) {
        clear_field("error_message");
        add_text_element_on_page("Username is required", "error_message");
        return;
    } else if (password === null) {
        clear_field("error_message");
        add_text_element_on_page("Password is required", "error_message");
        return;
    } else if (password_check === null) {
        clear_field("error_message");
        add_text_element_on_page("Password check is required", "error_message");
        return;
    } else if (password_check !== password) {
        clear_field("error_message");
        add_text_element_on_page("Original password doesn't match with the second one", "error_message");
        return;
    }

    fetch("/signup/create", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
            username: username,
            password: password,
        })
    })
        .then(response => response.json())
        .then(json => {
            if (json === null) {
                return
            }
            if (json["created"] === 0) {
                add_text_element_on_page("User with this username already exists", "error_message");
            } else {
                redirection();
            }
        })
        .catch(error => console.error(error));
}


/**

 * Signs up user to website

 */
function connect_to_room() {
    clear_field("error_message");

    let room_id = get_text_by_id("room_id");
    let password = get_text_by_id("room_password");
    let token = sessionStorage.getItem("token");

    if (!token) {
        clear_field("error_message");
        add_text_element_on_page("You are not signed in", "error_message");
        return;
    }

    if (room_id === null) {
        clear_field("error_message");
        add_text_element_on_page("Room is required", "error_message");
        return null
    } else if (password === null) {
        clear_field("error_message");
        add_text_element_on_page("Room password is required", "error_message");
        return null
    }

    fetch("/game/connect", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "token": token,
        },
        body: JSON.stringify({
            id: room_id,
            password: password,
        })
    })
        .then(response => response.json())
        .then(json => {
            if (json["room"] === 0) {
                clear_field("error_message");
                add_text_element_on_page("No such room", "error_message");
            } else if (json["password"] === 0) {
                clear_field("error_message");
                add_text_element_on_page("Wrong room password", "error_message");
            } else if (json["user"] === 0) {
                clear_field("error_message");
                add_text_element_on_page("You are not signed in", "error_message");
            } else if (json["full"] === 1) {
                clear_field("error_message");
                add_text_element_on_page("Room is already full", "error_message");
            } else {
                sessionStorage.setItem("link", "ws://127.0.0.1:8000/ws/" + room_id);
                redirection("http://127.0.0.1:8000/game/game");
            }
        })
        .catch(error => console.error(error));
}


function create_room() {
    let max_players = get_text_by_id("max_players");
    let password = get_text_by_id("room_password");

    if (!sessionStorage.getItem("token")) {
        clear_field("error_message");
        add_text_element_on_page("You are not signed in", "error_message");
        return;
    }

    fetch("/game/create_room/create", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "token": sessionStorage.getItem("token"),
        },
        body: JSON.stringify({
            max_players: max_players,
            password: password,
        })
    })
        .then(response => response.json())
        .then(json => {
            console.log(json);

            if (json["room"] === 0) {
                clear_field("error_message");
                add_text_element_on_page("No such room", "error_message");
            } else if (json["password"] === 0) {
                clear_field("error_message");
                add_text_element_on_page("Wrong room password", "error_message");
            } else if (json["user"] === 0) {
                clear_field("error_message");
                add_text_element_on_page("You are not signed in", "error_message");
            } else if (json["full"] === 1) {
                clear_field("error_message");
                add_text_element_on_page("Room is already full", "error_message");
            } else {
                alert("id:" + json["room_id"] + "\n" + "room password: " + json["room_password"]);
                redirection("/game/connect_to_room");
            }

        })
        .catch(error => console.error(error));
}


function load_user_profile_button() {
    console.log("fucntion is started");
    let name = sessionStorage.getItem("name");
    const user_name_element = document.getElementById("user_name");
    if (!user_name_element) {
        console.log("no user name element on page");
        return;
    }
    if (!name || is_hiden("user_name")) {
        user_name_element.style.display = "none";
        return;
    }

    show_element_by_id("user_name");
    user_name_element.innerHTML = name;

    user_name_element.onclick = function () {
        console.log("hahah");
        redirection("/profile");
    }
}

function hide_element_by_id(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.log("no such element");
        return;
    }

    element.style.display = "none";
}

function is_hiden(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.log("no such element");
        return;
    }

    return element.style.display === "none";
}

function show_element_by_id(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.log("no such element");
        return;
    }

    return element.style.display === "block";
}

setTimeout(load_user_profile_button, 10)
