var request = indexedDB.open('todo', 1);
var requestDone = indexedDB.open('done', 1);

request.onupgradeneeded = function (e) {
    var db = e.target.result;

    if(!db.objectStoreNames.contains('todo')) {
        var os = db.createObjectStore('todo', {keyPath: "id", autoIncrement:true});
        os.createIndex('name', 'name', {unique:false});
    }
};

request.onsuccess = function (e) {
    console.log('Success: acces a la base des taches en cours');
    db = e.target.result;
    showTodos();
};


request.onerror = function (e) {
    console.log('Error: Could Not Open Database');
};

requestDone.onupgradeneeded = function (e) {
    var dbdone = e.target.result;

    if(!dbdone.objectStoreNames.contains('done')) {
        var os = dbdone.createObjectStore('done', {keyPath: "id", autoIncrement:true});
        os.createIndex('name', 'name', {unique:false});
    }
};

requestDone.onsuccess = function (e) {
    console.log('Success: acces a la base des taches terminées');
    dbdone = e.target.result;
    showDone();
};

requestDone.onerror = function (e) {
    console.log('Error: Could Not Open Database');
};


function addTodo() {
    var name = document.getElementById('item').value;

    var trasaction = db.transaction('todo', "readwrite");
    var store = trasaction.objectStore('todo');
    if(name != ''){
        var todo = {
        name: name
        };
        var request = store.add(todo);

        request.onsuccess = function (e) {
            document.getElementById('item').value = '';
            showTodos();
        };

        request.onerror = function (e) {
            console.log("Error: ", e.target.error.name);
        }
    }
    
}

function showTodos(e) {
    const todo = document.getElementById('todo');
    var transaction = db.transaction('todo', "readonly");
    var store = transaction.objectStore('todo');
    var index = store.index('name');

    var removeIcon = '<i class="fa fa-trash-o" aria-hidden="true"></i>';
    var completeIcon = '<i class="fa fa-check-square-o" id="todobox" aria-hidden="true"></i>';
    var output = '';
    index.openCursor().onsuccess = function (e) {
        var cursor = e.target.result;
        if(cursor) {
            output += '<li>' + cursor.value.name + '<div class="buttons">' + '<button name="delete" class="remove" onclick="deleteItem(' + cursor.value.id + ')">' + removeIcon + '</button>' + '<button name="complete" class="complete" onclick="fulfillTodo(' + cursor.value.id + ')">' + completeIcon + '</button>' + '</li>';
            cursor.continue();
        }
        todo.innerHTML = output;
    }
}

function deleteItem(id) {
    var transaction = db.transaction('todo', "readwrite");
    var store = transaction.objectStore('todo');
    var request = store.delete(id);

    request.onsuccess = function () {
        console.log('todo deleted');
        showTodos();
        showDone();
    };

    request.onerror = function (e) {
        console.log('Error', e.target.error.name);
    };
}


function showDone(e) {
    const todoCompleted = document.getElementById('completed');
    var transaction = dbdone.transaction('done', "readonly");
    var store = transaction.objectStore('done');
    var index = store.index('name');

    var removeIcon = '<i class="fa fa-trash-o" aria-hidden="true"></i>';
    var output = '';
    index.openCursor().onsuccess = function (e) {
        var cursor = e.target.result;
        if(cursor) {
            output += '<li>' + cursor.value.name + '<div class="buttons">' + '<button name="delete" class="remove" onclick="deleteDoneItem(' + cursor.value.id + ')">' + removeIcon + '</button>' + '</li>';
            cursor.continue();
        }
        todoCompleted.innerHTML = output;
    }
}


function fulfillTodo(id) {
    var tx = db.transaction('todo');
    var todoOS = tx.objectStore('todo');
    var toDo = todoOS.get(id);

    toDo.onsuccess = function () {
        processTodo(toDo);
    }
}

function processTodo(todo) {
        var tx = dbdone.transaction('done', 'readwrite');
        var store = tx.objectStore('done');
        deleteItem(todo.result.id);
        var name = todo.result.name;
        console.log(name);
        var item = ({
            name: name
        });
        store.add(item);
        return tx.complete;
}

function deleteDoneItem(id) {
    var transaction = dbdone.transaction('done', "readwrite");
    var store = transaction.objectStore('done');
    var request = store.delete(id);

    request.onsuccess = function () {
        console.log('todo deleted');
        showTodos();
        showDone();
    };

    request.onerror = function (e) {
        console.log('Error', e.target.error.name);
    };
}