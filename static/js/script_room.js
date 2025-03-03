const amount_fields = $(".field_edge, .field_cl, .field_rv").length;
const players_info = []
let fields_info = [];
const stations_info = [];
const amount_staitons = 22;

const room_id = sessionStorage.getItem("room_id");

let my_id = -1;

const websocket_link = sessionStorage.getItem("link");

console.log(websocket_link);
const socket = new WebSocket(websocket_link);

const index_stations_list = [1, 3, 6, 8, 9, 11, 13, 14, 16, 18, 19, 21, 23, 24, 26, 27, 29, 31, 32, 34, 37, 39]

let amount_players = 0;
let index_moving_palyer = 0;
let is_game_started = false;
let selected_field_id = 0;

init_fields_info();
// init_staitons_info();

// =================================================================
// SOCKET LOGIC
socket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    const content = data.content;

    console.log(data.type, content);

    switch (data.type) {
        case "move":
            move_player(content.user_id - 1, content.position);
            break;

        case "change_money":
            console.log("CONTENT: ", content.user_id, content.amount);
            change_money(content.user_id, content.amount);
            break;

        case "add_station":
            add_station(content.user_id, content.field_id);
            break;

        case "add_train":
            add_train(content.field_id);
            break;

        case "remove_player":
            remove_player(content.user_id);
            break;

        case "start_game":
            console.log("start_game!");
            start_game(content);
            break;

        case "next_move":
            next_move();
            break;
        
        default:
            console.error(`Unknown type request from server: ${data.type}`);
            break;
    }
}
            
socket.onclose = function () {
    console.log("websocket closed");
    // websocket_send_remove_player(my_id);
    // remove_player(my_id);
}

// =================================================================
// INIT FUNCTIONS
function init_fields_info() {
    fields_info =[
        {
            "type": "start",
            "color": "#fa2323",
            "name": "Стартовое поле",
            "description": "За каждый пройденный круг вам будет начисляться по 200"
        },
        {
            "type": "station",
            "color": "#fa6723",
            "price": 100,
            "name": "м. Шаболовская",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "chance",
            "color": "#4f62e0",
            "name": "Поле Шанс",
            "description": "Попадая на это поле вы тяните карту и выполняете задание."
        },
        {
            "type": "station",
            "price": 120,
            "color": "#fa6723",
            "name": "м. Китай-Город",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "tax",
            "color": "#26914a",
            "price": 200,
            "name": "Подоходный Налог",
            "description": "При попадании на это поле заплатите 200"
        },
        {
            "type": "empty",
            "name": "Отдых",
            "color": "#d9d7d4",
            "description": "Можете отдохнуть"
        },
        {
            "type": "station",
            "price": 100,
            "name": "м. Динамо",
            "color": "#1fa61f",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "chance",
            "price": 100,
            "name": "Поле Шанс",
            "color": "#4f62e0",
            "description": "Попадая на это поле вы тяните карту и выполняете задание."
        },
        {
            "type": "station",
            "price": 100,
            "name": "м. Театральная",
            "color": "#1fa61f",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "station",
            "price": 100,
            "name": "м. Автозаводская",
            "color": "#1fa61f",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "depot",
            "name": "Депо",
            "color": "#1fa61f",
            "description": "Вы просто посетитель депо."
        },
        {
            "type": "station",
            "price": 100,
            "name": "м. Арбатская",
            "color": "#114acf",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "power_station",
            "price": 200,
            "name": "Электростанция",
            "color": "#55b8e6",
            "owner": null,
            "rent": 100,
            "amount_trains": 0
        },
        {
            "type": "station",
            "price": 100,
            "name": "м. Киевская",
            "color": "#114acf",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "station",
            "price": 100,
            "name": "м. Славянский бульвар",
            "color": "#114acf",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "empty",
            "name": "Отдых",
            "color": "#d9d7d4",
            "description": "Можете отдохнуть"
        },
        {
            "type": "station",
            "price": 100,
            "name": "м. Библиотека имени Ленина",
            "color": "#f31923",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "chance",
            "price": 100,
            "name": "Поле Шанс",
            "color": "#4f62e0",
            "description": "Попадая на это поле вы тяните карту и выполняете задание."
        },
        {
            "type": "station",
            "price": 100,
            "name": "м. Фрунзенская",
            "color": "#f31923",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "station",
            "price": 100,
            "name": "м. Спортивная",
            "color": "#f31923",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "9.75",
            "name": "Платформа 9 и 3/4",
            "color": "#7457e0",
            "description": "Пролетел"
        },
        {
            "type": "station",
            "price": 100,
            "name": "м. Парк Культуры",
            "color": "#441212",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "chance",
            "price": 100,
            "name": "Поле Шанс",
            "color": "#4f62e0",
            "description": "Попадая на это поле вы тяните карту и выполняете задание."
        },
        {
            "type": "station",
            "price": 100,
            "name": "м. Белорусская",
            "color": "#441212",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "station",
            "price": 100,
            "name": "м. Краснопресненская",
            "color": "#441212",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "empty",
            "name": "Отдых",
            "color": "#d9d7d4",
            "description": "Можете отдохнуть"
        },
        {
            "type": "station",
            "price": 100,
            "name": "м. Полянка",
            "color": "#757575",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "station",
            "price": 100,
            "name": "м. Тульская",
            "color": "#757575",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "power_station",
            "price": 200,
            "name": "Водопровод",
            "color": "#09ecec",
            "owner": null,
            "rent": 100,
            "amount_trains": 0
        },
        {
            "type": "station",
            "price": 100,
            "name": "м. Цветной Бульвар",
            "color": "#757575",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "Prison",
            "name": "Тюрьма",
            "color": "#383838",
            "description": "Не пролетел"
        },
        {
            "type": "station",
            "price": 100,
            "name": "м. Баррикадная",
            "color": "#3f209b",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "station",
            "price": 100,
            "name": "м. Спартак",
            "color": "#3f209b",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "chance",
            "price": 100,
            "name": "Поле Шанс",
            "color": "#4f62e0",
            "description": "Попадая на это поле вы тяните карту и выполняете задание."
        },
        {
            "type": "station",
            "price": 100,
            "name": "м. Марксистская",
            "color": "#3f209b",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "empty",
            "name": "Отдых",
            "color": "#d9d7d4",
            "description": "Можете отдохнуть"
        },
        {
            "type": "chance",
            "price": 100,
            "name": "Поле Шанс",
            "color": "#4f62e0",
            "description": "Попадая на это поле вы тяните карту и выполняете задание."
        },
        {
            "type": "station",
            "price": 100,
            "name": "Опалиха",
            "color": "#ea748c",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        },
        {
            "type": "supertax",
            "payment": 1000,
            "name": "НАЛОГИ",
            "color": "#daa51f",
            "description": "Попадая на это поле вы теряете все ваше имущество."
        },
        {
            "type": "station",
            "price": 100,
            "name": "Аникеевка",
            "color": "#ea748c",
            "owner": null,
            "rent_0_train": 30,
            "rent_1_train": 60,
            "rent_2_train": 80,
            "rent_3_train": 100,
            "rent_4_train": 120,
            "add_train_price": 50,
            "amount_trains": 0
        }
    ]
    // const list_station_names = ["Университет", "Новочеремушкинская", "Профсоюзная", "Охотный ряд", "Китай город", "Лубянка"];
    // for (let i = 0; i < amount_fields; i++) {
    //     let n = randint(100, 300);
    //     fields_info.push({
    //         "type": "station",
    //         "price": n,
    //         "name": "м. " + list_station_names[randint(0, list_station_names.length - 1)],
    //         "owner": null,
    //         "rent_0_train": randint(50, 150),
    //         "rent_1_train": randint(50, 150),
    //         "rent_2_train": randint(50, 150),
    //         "rent_3_train": randint(50, 150),
    //         "rent_4_train": randint(50, 150),
    //         "add_train_price": randint(10, 60),
    //         "amount_trains": 0
    //     });        
    // };
};

// function init_staitons_info() {
//     const URL = "http://localhost:800/get_stations_info"
//     fetch(URL,
//         {
//             "method": "GET",
//             "headers": {
//                 "Content-Type": "application/json",
//             },
//         })
//         .then((response) => response.text())
//         .then((text) => JSON.parse(text))
//         .then((json) => {
//             globalThis.stations = json;
//         })
//         .catch((error) => console.log(error));	
    
// }

// =================================================================
// PAGE LOGIC
$(document).ready(function () {
    let is_dice_turning = false;

    // init color for fields
    for (let i = 0; i < 40; i++) {
        $("#field" + i).css({ "background-color": fields_info[i].color });
    }

    $("#button_next_move").click(function () { 
        if (my_id - 1 != index_moving_palyer) {
            alert_message("Это еще не ваш ход");
            return;
        }
        if ($(this).css("class") == "unactivated_button") {
            alert_message("Вы еще не сделали ход");
            return;
        }

        index_moving_palyer = (index_moving_palyer + 1) % amount_players;

        websocket_send_next_move();
        $(this).attr("class", "unactivated_button");
        $("#button_buy_train").attr("class", "unactivated_button");
        $("#button_buy_station").attr("class", "unactivated_button");
    });

    // =================================================================
    // DICE LOGICK BLOCK
    $("div.dice_countiner img").hover(function () {
        // over
        if (!is_dice_turning &&
            index_moving_palyer == my_id - 1 &&
            $("#button_next_move").attr("class") != "activated_button") {
            $(this).css("transform", "scale(1.1)");
        }

    }, function () {
        // out
        $(this).css("transform", "scale(1)");
    }
    );

    $("div.dice_countiner img").click(function () {
        if (!is_game_started) {
            alert_message("Игра еще не начата");
            return;
        }
        if (is_dice_turning) {
            return;
        }
        if (index_moving_palyer != my_id - 1) {
            alert_message("Это не ваш ход");
            return;
        }
        if ($("#button_next_move").attr("class") == "activated_button") {
            alert_message("Вы уже сделали свой ход.");
            return;
        }

        is_dice_turning = true;

        let step = 0;

        let current_dice_index = 0;

        const change_dice_img = setInterval(function () {
            let first_dice = randint(1, 6);
            let second_dice = randint(1, 6);

            step = first_dice + second_dice;

            $("div.dice_countiner img").eq(0).attr("src", `../static/media/images/dice/dice${first_dice}.png`);
            $("div.dice_countiner img").eq(1).attr("src", `../static/media/images/dice/dice${second_dice}.png`);
            current_dice_index = (current_dice_index + 1) % 6;
        }, 165);

        setTimeout(function () {

            clearInterval(change_dice_img);
            console.log(index_moving_palyer);

            const current_postiton = players_info[index_moving_palyer].position;
            const new_position = (current_postiton + step - 1) % amount_fields + 1;

            move_player(index_moving_palyer, new_position);
            websocket_send_move_player(players_info[index_moving_palyer].id, new_position);

            const new_field_info = fields_info[new_position - 1];

            if (new_field_info.type == "station" && new_field_info.owner != null) {
                console.log("MONEY");
                const rent_price = new_field_info[`rent_${new_field_info.amount_trains}_train`];

                console.log("rent price: ", rent_price);
                console.log(new_field_info.amount_trains);
                console.log(`rent_${new_field_info.amount_trains}}_train`);
                console.log(new_field_info[`rent_${new_field_info.amount_trains}}_train`]);

                const owner = new_field_info.owner;
                const payer = players_info[index_moving_palyer];

                payer.money -= rent_price;
                owner.money += rent_price;

                websocket_send_change_money(owner.id, owner.money);
                websocket_send_change_money(payer.id, payer.money);

                update_money();
                
                if (payer.money < 0) {
                    websocket_send_remove_player(payer.id);
                    remove_player(payer.id);
                }

            }
            else {
                console.log("NOMONEY", new_field_info.type, new_field_info.owner, index_moving_palyer);
            }

            if (my_id - 1 == index_moving_palyer) {
                $("#button_next_move").attr("class", "activated_button");
            }

            is_dice_turning = false;
        }, 3000);


    });
    
    // =================================================================
    // GAMEBOARD BLOCK

    $(".field_edge, .field_cl, .field_rv").click(function () {
        const my_player_index = my_id - 1;
        const field_index = get_field_index(this);
        const field_info = fields_info[field_index];
        
        selected_field_id = field_index + 1;

        show_field_info(this);
    });

    $(".field_edge, .field_cl, .field_rv").hover(function () {
        $(this).css("z-index", "3");

        let field_index = get_field_index(this);
        const field_info = fields_info[field_index];

        $(this).append(
            $(document.createElement("div"))
                .attr("id", "flex_station_name")
                .css("z-index", 4)
                .text(field_info.name)
        );
    }, function () {
        $(this).css("z-index", "1");
        $(this).find("#flex_station_name").remove();
    }
    );

    // =================================================================
    // ASIDE BLOCK

    $("aside button").hover(function () {
        // over
        if ($(this).attr("class") == "activated_button") {
            $(this).css("transform", "scale(1.03)");
        }
    }, function () {
        // out
        $(this).css("transform", "scale(1)");
    }
    );

    $("#button_buy_station").click(function () {
        if (!is_game_started) {
            alert_message("игра еще не начата");
            return;
        }

        const player_index = my_id - 1;

        if (player_index != index_moving_palyer) {
            alert_message("не ваш ход");
            return;
        }
        if ($(this).attr("class") == "unactivated_button") {
            return;
        }

        const player = players_info[player_index];
        const field = fields_info[player.position - 1];

        if (field.owner != null) {
            return;
        }
        if (player.money < field.price) {
            return;
        }

        player.money -= field.price;
        field.owner = player;

        websocket_send_change_money(player.id, player.money);

        websocket_send_add_station(field.owner.id, player.position);

        update_money();
        update_leaderboard();

        let field_object = $("#field" + (players_info[player_index].position))[0];
        show_metro_field(field_object);

        // $(this).removeClass().addClass("unactivated_button");
        // $("#button_buy_train").removeClass().addClass("activated_button");
    });

    $("#button_buy_train").click(function () {
        if (!is_game_started) {
            console.log("game is not started");
            return;
        }

        if ($(this).attr("class") == "unactivated_button") {
            return;
        }

        const player = players_info[my_id - 1];

        let field = fields_info[selected_field_id - 1];

        player.money -= field.add_train_price;
        field.amount_trains++;


        websocket_send_change_money(field.owner.id, field.owner.money);
        websocket_send_add_train(selected_field_id);

        update_money();
        update_leaderboard();

        let field_object = $("#field" + (selected_field_id))[0];

        show_metro_field(field_object);
        console.log(field.amount_trains);
    });
});

// =================================================================
// PLAYERS FUNCTIONS
function add_player(player_name, start_field_index = 1) {
    const start_field_id = "field" + start_field_index;
    const field = $("#" + start_field_id);

    // setting up new palyer box
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);

    const id_new_player = amount_players + 1;
    const new_player = $(document.createElement("div"))
        .attr({ "class": "player", "id": "player" + (id_new_player) })
        .css({ "background-color": `rgb(${red}, ${green}, ${blue})` });

    field.append(new_player);
    move_players_in_field(field);
    let money = 2000;

    players_info.push({
        "name": player_name,
        "money": money,
        "id": id_new_player,
        "position": start_field_index,
        "box": new_player
    });

    amount_players++;

    let player = $(players_info[amount_players - 1].box);

    let color = player.css("background-color");

    let money_сolumn = $(document.createElement("div"))
        .addClass("money_column")
        .css({ "background-color": color })
        .attr("id", "column" + amount_players);

    let name = $(document.createElement("div"))
        .addClass("leaderboard_player_name")
        .text(players_info[amount_players - 1].name);

    let money_column_container = $(document.createElement("div"))
        .addClass("money_column_container")
        .append(money_сolumn, name);

    $(".leaderboard").append(money_column_container);
    setTimeout(update_leaderboard, 5);

    $(money_сolumn).hover(function () {
        $(this).css({ "transition": "0.2s" });

        const player_id = parseInt($(this).attr("id").replace("column", ""));
        const player_money = players_info.find(player => player.id == player_id).money;
        $(this).append(
            $(document.createElement("div"))
                .attr("id", "flex_station_name")
                .css("z-index", 4)
                .text(player_money)
        );

    }, function () {
        $(this).css({ "transition": "0.5s" });
        $(this).find("#flex_station_name").remove();
    }
    );
}

function move_player(player_index, new_position) {
    const player = players_info[player_index];
    const new_field = $("#field" + new_position);

    $(player.box).hide(150, "linear", function () {
        const previus_field = $(player.box).parent();

        $(player.box).appendTo(new_field);

        move_players_in_field(previus_field);
        move_players_in_field(new_field);

        $(player.box).show(150);
        player.position = new_position;

        if (player_index == my_id - 1) {
            if (fields_info[player.position - 1].type == "station") {
                show_metro_field($("#field" + new_position)[0]);
            }
            else {
                show_field_info($("#field" + new_position)[0]);
            }
        }

    });
}

function move_players_in_field(field) {
    const players_in_current_field = field.find(".player");

    switch (players_in_current_field.length) {
        case 1:
            $(players_in_current_field).animate({ "top": "50%", "left": "50%" });
            break;
        case 2:
            $(players_in_current_field[0]).animate({ "top": "25%", "left": "50%" });
            $(players_in_current_field[1]).animate({ "top": "75%", "left": "50%" });
            break;
        case 3:
            $(players_in_current_field[0]).animate({ "top": "25%", "left": "25%" });
            $(players_in_current_field[1]).animate({ "top": "25%", "left": "75%" });
            $(players_in_current_field[2]).animate({ "top": "75%", "left": "50%" });
            break;
        case 4:
            $(players_in_current_field[0]).animate({ "top": "25%", "left": "25%" });
            $(players_in_current_field[1]).animate({ "top": "25%", "left": "75%" });
            $(players_in_current_field[2]).animate({ "top": "75%", "left": "25%" });
            $(players_in_current_field[3]).animate({ "top": "75%", "left": "75%" });
            break;
        case 5:
            $(players_in_current_field[0]).animate({ "top": "22%", "left": "22%" });
            $(players_in_current_field[1]).animate({ "top": "22%", "left": "78%" });
            $(players_in_current_field[2]).animate({ "top": "78%", "left": "22%" });
            $(players_in_current_field[3]).animate({ "top": "78%", "left": "78%" });
            $(players_in_current_field[4]).animate({ "top": "50%", "left": "50%" });
            break;
        case 6:
            $(players_in_current_field[0]).animate({ "top": "20%", "left": "20%" });
            $(players_in_current_field[1]).animate({ "top": "20%", "left": "80%" });
            $(players_in_current_field[2]).animate({ "top": "80%", "left": "20%" });
            $(players_in_current_field[3]).animate({ "top": "80%", "left": "80%" });
            $(players_in_current_field[4]).animate({ "top": "20%", "left": "50%" });
            $(players_in_current_field[5]).animate({ "top": "80%", "left": "50%" });
    }
}

// =================================================================
// SHOWING INFO FUNCTIONS
function show_field_info(field) {
    const field_index = get_field_index(field);
    const field_info = fields_info[field_index];

    if (field_info.type == "station") {
        show_metro_field(field)
    }
    else {
        show_another_field(field)
    }
}

function show_metro_field(field) {
    $(".databoard").empty();
    const field_index = get_field_index(field);
    const field_info = fields_info[field_index];

    selected_field_id = field_index + 1;

    let div = $(document.createElement("div"))
        .css({ "margin-bottom": "20px", "width": "100%" });

    if (field_info.owner != null) {
        $(".databoard").append(
            $(document.createElement("div"))
                .css({ "text-align": "center", "font-size": "20px", "margin-bottom": "5px" })
                .text(`~ ${field_info.owner.name} ~`)
        );
    }

    const color = $(field).css("background-color");

    const station_name_container = $(document.createElement("div"))
        .addClass("station_name")
        .css({
            "background-color": color,
            "margin-bottom": "10px"
        })
        .text(field_info.name);

    const station_price_container = $(document.createElement("div"))
        .addClass("station_price")
        .text(field_info.price);

    const station_visitation_default_price_title = $(document.createElement("p"))
        .addClass("station_price_info_title")
        .text("проезд по пустой станиции");

    const station_visitation_default_price_value = $(document.createElement("p"))
        .addClass("station_price_info_value")
        .text(field_info.rent_1_train);

    $(".databoard").append(
        station_name_container,
        station_price_container,
        $(div).append(
            station_visitation_default_price_title,
            station_visitation_default_price_value,
            "<br/>",
        )
    );

    const station_visitation_with_train_price_title = $(document.createElement("p"))
        .addClass("station_price_info_title");

    const station_visitation_with_train_price_value = $(document.createElement("p"))
        .addClass("station_price_info_value");

    for (let i = 1; i <= 4; i++) {
        let is_train_bought = (i == field_info.amount_trains ? "  ●" : "");
        $(".databoard").append(
            $($(div).clone().empty()).append(
                $(station_visitation_with_train_price_title)
                    .clone().text(`– ${i} поезд` + (i != 1 ? "a" : "") + is_train_bought),

                $(station_visitation_with_train_price_value).
                    clone().text(field_info[`rent_${i}_train`]),
                "<br/>"
            )
        );
    }

    let sep_line = $(document.createElement("div"))
        .css({
            "height": "1px",
            "width": "100%",
            "background-color": "black",
            "margin-bottom": "10px"
        });


    $(".databoard").append(sep_line);

    div = $(document.createElement("div"))
        .css({ "margin-bottom": "15px", "width": "100%" });

    let station_build_train_price_title = $(document.createElement("p"))
        .addClass("station_price_info_title")
        .text("Добавление поезда");

    let station_build_train_price_value = $(document.createElement("p"))
        .addClass("station_price_info_value")
        .text(field_info["add_train_price"])

    $(".databoard").append(
        $(div).append(
            station_build_train_price_title,
            station_build_train_price_value,
            "<br/>"
        )
    );

    $(".databoard").append($(sep_line).clone());
    if (!is_game_started) {
        $("#button_buy_station").attr("class", "activated_button");
        $("#button_buy_train").attr("class", "unactivated_button");
    }
    else if (field_info.owner == null) {
        if (field_info == fields_info[players_info[my_id - 1].position - 1]) {
            
            $("#button_buy_station").attr("class", "activated_button");
        }
        else {
            $("#button_buy_station").attr("class", "unactivated_button");
        }

        $("#button_buy_train").attr("class", "unactivated_button");
    }
    else if (field_info.owner.id == my_id) {
        $("#button_buy_station").attr("class", "unactivated_button");

        if (field_info.amount_trains >= 4) {
            $("#button_buy_train").attr("class", "unactivated_button");
        }
        else {
            $("#button_buy_train").attr("class", "activated_button");
        }
    }
    else {
        $("#button_buy_train").attr("class", "unactivated_button");
        $("#button_buy_station").attr("class", "unactivated_button");
    }
}

function show_another_field(field) {
    $(".databoard").empty();
    const field_index = get_field_index(field);
    const field_info = fields_info[field_index];

    selected_field_id = field_index + 1;

    const color = $(field).css("background-color");

    const station_name_container = $(document.createElement("div"))
        .addClass("station_name")
        .css({
            "background-color": color,
            "margin-bottom": "10px"
        })
        .text(field_info.name);
        $(".databoard").append(
            station_name_container,
    );
    
    $("#button_buy_train").attr("class", "unactivated_button");
    $("#button_buy_station").attr("class", "unactivated_button");
    
}

// =================================================================
// UPDATING DATA FUNCTIONS
function update_leaderboard() {
    const max_money = players_info.reduce((max, player) => Math.max(max, player.money), 0);

    for (let index = 0; index < amount_players; index++) {
        const money = players_info[index].money;
        const delt = (money / max_money) * 90;

        $("#column" + (index + 1))
            .css({ 'top': `${90 - delt}%`, "height": `${delt}%` }, 500);
    };
}

function update_money() {
    let player_index = my_id - 1;
    $(".money")
        .text(players_info[player_index].money);
}

// =================================================================
// AUXILIARY FUNCTIONS
function randint(minimum_num, maximum_num) {
    let dif = maximum_num - minimum_num + 1;
    let number = Math.ceil(Math.random() / (1 / dif));

    return minimum_num - 1 + number;
};

function get_field_index(field) {
    let id_attr = $(field).attr("id");
    return parseInt(id_attr.replace("field", "")) - 1;
}

function alert_message(content) {
    const message_element =
        $(document.createElement("p"))
            .attr("class", "message")
            .click(function () {
                $(this).remove();
            })
            .text(content);

    $("body").append(
        message_element
    );

    message_element.animate({ "top": "0px", "opacity": "0%" }, 5000, "linear", function () {
        message_element.remove();
    });
}

// =================================================================
// EDITING DATA FUNCTIONS

function change_money(player_id, amount) {
    console.log("PLAYER ID: ", player_id, "; AMOUNt: ", amount);
    players_info[player_id - 1].money = amount;
    update_leaderboard();
}

function add_station(player_id, field_id) {
    console.log(field_id);
    fields_info[field_id - 1].owner = players_info[player_id - 1];
}

function add_train(field_id) {
    console.log(field_id);
    fields_info[field_id - 1].amount_trains++;
}

function remove_player(player_id) {
    const player_index = player_id - 1;
    const player = players_info[player_index];

    const stations = fields_info.filter(field => field.owner == player);

    stations.forEach(station => {
        station.amount_trains = 0;
        station.owner = null;
    });

    $(players_info[player_index].box).remove()
    $("#leaderboard .money_column_container").eq(player_index).remove();
    move_players_in_field($(`#field${player.position}`));

    players_info.splice(player_index, 1);
    amount_players--;

    if (player_id == my_id) {
        window.location.replace("http://127.0.0.1:8000/game/lose");
    }
    else if (amount_players == 1) {
        window.location.replace("http://127.0.0.1:8000/game/win");
    }
}

function start_game(players) {
    const my_name = sessionStorage.getItem("name");

    players.forEach(player => {
        add_player(player.name);

        if (player.name == my_name) {
            my_id = amount_players;
        }
    });

    is_game_started = true;
    update_money();

    $("aside button").addClass("unactivated_button");
    $(".leaderboard_player_name").eq(my_id - 1)
        .text("me")
        .css({
            "font-weight": "600"
    });
}

function next_move() {
    index_moving_palyer = (index_moving_palyer + 1) % amount_players;    
}

// =================================================================
// WEBSOCKET FUNCTIONS

function websocket_send_message(type, content) {
    const data = { "type": type, "content": content };
    socket.send(JSON.stringify(data));
}

function websocket_send_move_player(player_id, new_position) {
    websocket_send_message("move", { "user_id": player_id, "position": new_position });
}

function websocket_send_change_money(player_id, amount) {
    websocket_send_message("change_money", { "user_id": player_id, "amount": amount });
}

function websocket_send_add_station(player_id, field_id) {
    websocket_send_message("add_station", { "user_id": player_id, "field_id": field_id });
}

function websocket_send_add_train(field_id) {
    websocket_send_message("add_train", { "field_id": field_id });
}

function websocket_send_remove_player(player_id) {
    websocket_send_message("remove", { "user_id": player_id });
}

function websocket_send_next_move() {
    websocket_send_message("next_move", {});
}
