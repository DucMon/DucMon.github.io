// to-do list
var ul = document.getElementById("todo-list");
var dataTodoList = [];

function createNew() {
    var input = document.getElementById("userInput");
    if (input.value != "") {
        dataTodoList.push({
            name: input.value,
            isCompleted: false
        });
    }
    input.value = "";
    renderContent(dataTodoList);
}

function renderContent(data) {
    var content = data.map(function(item, index) {
        var isCompleted = "";
        var icon = "\u00D7";
        if (item.isCompleted) {
            icon = "\u2713";
            isCompleted = "isCompleted";
        }

        return "<li class='" + isCompleted + "' onclick = 'finishWork(" + index + ")'>" + item.name +
            "<span id ='close" + index + "' class = 'close' onclick = 'deleteItem(event," + index + ")' >" + icon + "</span>" + "</li>";
    });
    console.log(content);
    ul.innerHTML = content.join("");
}

function finishWork(index) {
    var index = parseInt(index);
    dataTodoList[index].isCompleted = true;
    renderContent(dataTodoList);
}
renderContent(dataTodoList);

function deleteItem(e, index) {
    e.stopPropagation();
    dataTodoList.splice(index, 1);
    renderContent(dataTodoList);
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