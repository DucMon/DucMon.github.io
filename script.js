// to-do list
var ultodo = document.getElementById("todo-list");
var ulSchedule = document.getElementById("schedule-list");
var ulGoal = document.getElementById("goal-list");
var dataTodoList = [];
var dataGoalList = [];
var dataScheduleList = [];

function createNewToDo() {
    var input = document.getElementById("userInputToDo");
    if (input.value != "") {
        dataTodoList.push({
            name: input.value,
            isCompleted: false
        });
    }
    input.value = "";
    renderContentToDo(dataTodoList);
}

function createNewGoal() {
    var input = document.getElementById("userInputGoal");
    if (input.value != "") {
        dataGoalList.push({
            name: input.value,
            isCompleted: false
        });
    }
    input.value = "";
    renderContentGoal(dataGoalList);
}
function createNewSchedule() {
    var input = document.getElementById("userInputSchedule");
    var Hour = document.getElementById("Hour").value;
    var Minute = document.getElementById("Minute").value;
    var Meridiem = document.getElementById("Meridiem").value;
    var time = Hour +":"+ Minute +" "+ Meridiem;
    if (input.value != "") {
        dataScheduleList.push({
            name: input.value,
            time: time
        });
    }
    input.value = "";
    renderContentSchedule(dataScheduleList);
}
function renderContentSchedule(data) {
    var content = data.map(function(item, index) {
        var isCompleted = "";
        var icon = "<i class='fa fa-close' aria-hidden='true'></i>";
        if (item.isCompleted) {
            icon = "<i class='fa fa-check' aria-hidden='true'></i>";
            isCompleted = "isCompleted";
        }

        return "<li><b>" + item.time + "</b> " + item.name +
            "<span id ='close" + index + "' class = 'close' onclick = 'deleteSchedule(event," + index + ")' >" + icon + "</span>" + "</li>";
    });
    console.log(content);
    ulSchedule.innerHTML = content.join("");
}

function renderContentGoal(data) {
    var content = data.map(function(item, index) {
        var isCompleted = "";
        var icon = "<i class='fa fa-close' aria-hidden='true'></i>";
        if (item.isCompleted) {
            icon = "<i class='fa fa-check' aria-hidden='true'></i>";
            isCompleted = "isCompleted";
        }

        return "<li class='" + isCompleted + "' onclick = 'finishGoal(" + index + ")'>" + item.name +
            "<span id ='close" + index + "' class = 'close' onclick = 'deleteItemGoal(event," + index + ")' >" + icon + "</span>" + "</li>";
    });
    console.log(content);
    ulGoal.innerHTML = content.join("");
}

function renderContentToDo(data) {
    var content = data.map(function(item, index) {
        var isCompleted = "";
        var icon = "<i class='fa fa-close' aria-hidden='true'></i>";
        if (item.isCompleted) {
            icon = "<i class='fa fa-check' aria-hidden='true'></i>";
            isCompleted = "isCompleted";
        }

        return "<li class='" + isCompleted + "' onclick = 'finishWork(" + index + ")'>" + item.name +
            "<span id ='close" + index + "' class = 'close' onclick = 'deleteItem(event," + index + ")' >" + icon + "</span>" + "</li>";
    });
    console.log(content);
    ultodo.innerHTML = content.join("");
}
// finishitem
function finishWork(index) {
    var index = parseInt(index);
    dataTodoList[index].isCompleted = true;
    renderContentToDo(dataTodoList);
}
function finishGoal(index) {
    var index = parseInt(index);
    dataGoalList[index].isCompleted = true;
    renderContentGoal(dataGoalList);
}
// deleteItem
function deleteItem(e, index) {
    e.stopPropagation();
    dataTodoList.splice(index, 1);
    renderContentToDo(dataTodoList);
}
function deleteSchedule(e, index) {
    e.stopPropagation();
    dataScheduleList.splice(index, 1);
    renderContentSchedule(dataScheduleList);
}
function deleteItemGoal(e, index) {
    e.stopPropagation();
    dataGoalList.splice(index, 1);
    renderContentGoal(dataGoalList);
}
// clock
var monthNames = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];
function clock() {
    var time = new Date(),
    	date = time.getDate();
    	month = time.getMonth();
        hours = time.getHours(),
        minutes = time.getMinutes(),
        seconds = time.getSeconds();
    document.querySelectorAll('.clock')[0].innerHTML = check0(date) + " " +check0(monthNames[month]) + ", " + check0(hours) + ":" + check0(minutes) + ":" + check0(seconds);

    function check0(standIn) {
        if (standIn < 10) {
            standIn = '0' + standIn
        }
        return standIn;
    }
}
setInterval(clock, 1000);