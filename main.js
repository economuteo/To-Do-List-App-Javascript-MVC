class Controller {
    constructor(model, view) {
        // Attaches the model and the view to the controller
        this.model = model;
        this.view = view;

        // Display initial todos
        this.onToDoListChanged(this.model.toDos);

        //Bindings for connection between the view and the model through the controller
        this.view.bindAddToDo(this.handleAddToDo);
        this.view.bindRemoveToDo(this.handleRemoveToDo);
        this.view.bindResetList(this.handleReset);
        this.view.bindToggleToDo(this.handleRemoveToDo);
        this.view.bindEditToDo();
        this.view.bindSaveToDo(this.handleEditToDo);
        this.view.bindCancelToDo(this.handleEditToDo);
        this.model.bindTodoListChanged(this.onToDoListChanged);
    }

    // Creates a presentation for the new to do's values
    onToDoListChanged = (todos) => {
        this.view.displayTodos(todos);
    };

    // Handlers
    handleAddToDo = (text) => {
        this.model.addToDo(text);
    };
    handleRemoveToDo = (id) => {
        this.model.removeToDo(id);
    };
    handleReset = () => {
        this.model.resetList();
    };
    handleEditToDo = (id, newText) => {
        this.model.editToDo(id, newText);
    };
    /*
    handleToggleToDo = (id) => {
        this.model.toggleToDo(id);
    };
    */
}

class Model {
    // Custom constructor
    constructor() {
        // Logic behind the connection between the model and the local storage
        this.toDos = JSON.parse(localStorage.getItem("toDos")) || [];
    }

    // Data mutation logic
    // Add a specific to do object to the to do's array of objects
    addToDo(text) {
        const id = Date.now();
        let complete = false;
        //The to do task object format
        const toDo = {
            id: id,
            text: text,
            complete: complete,
        };
        this.toDos.push(toDo);
        this._commit(this.toDos);
    }
    // Remove a specific to do from the array of to do's
    removeToDo(id) {
        this.toDos = this.toDos.filter((toDo) => toDo.id !== id);
        this._commit(this.toDos);
    }
    // Edit the text of the to do
    editToDo(id, newText) {
        this.toDos = this.toDos.map((toDo) => {
            if (toDo.id === parseInt(id)) {
                toDo.text = newText;
            }
            return toDo;
        });
        this._commit(this.toDos);
    }
    /*
    // Change the state of completion of a to do task (true/false)
    toggleToDo(id) {
        this.toDos = this.toDos.map((toDo) => {
            if (toDo.id === id) {
                toDo.complete = !toDo.complete;
            }
            return toDo;
        });
        this._commit(this.toDos);
    }*/
    // Resets the to do's list
    resetList() {
        const todosResetted = [];
        this.toDos = todosResetted;
        this._commit(this.toDos);
    }

    //Bindings
    // Binding method for list changed
    bindTodoListChanged(callback) {
        this.onToDoListChanged = callback;
    }

    // Local storage method
    // Sets the new value of to do's to the local storage
    _commit(toDos) {
        this.onToDoListChanged(toDos);
        localStorage.setItem("toDos", JSON.stringify(toDos));
    }
}

class View {
    constructor() {
        // The root of the DOM tree
        this.app = this.getElement("#root");

        // Title
        this.title = this.createElement("h1", "title");
        this.title.textContent = "To Do List";

        // Form
        this.form = this.createElement("form", "form");

        // Input
        this.input = this.createElement("input", "input");
        this.input.autofocus = true;
        this.input.placeholder = "Add to do";
        // Button
        this.addButton = this.createElement("button", "submitButton");
        this.addButton.type = "submit";
        this.addButton.textContent = "Add";

        // Reset
        this.resetButton = this.createElement("button", "resetButton");
        this.resetButton.type = "button";
        this.resetButton.textContent = "Reset";

        // Append the childs to the form
        this.form.append(this.input, this.addButton, this.resetButton);

        // The text with the current tasks
        this.currentTasks = this.createElement("h3", "currentTasks");
        this.currentTasks.textContent = "Current Tasks:";

        // The to do list
        this.toDoList = this.createElement("ul", "toDoList");

        // Append the childs to the app
        this.app.append(this.title, this.form, this.currentTasks, this.toDoList);
    }

    // Elements helper methods
    // Element creator with optional class adder for CSS use
    createElement(tag, className) {
        const element = document.createElement(tag);
        element.classList.add(className);
        return element;
    }
    // Element getter
    getElement(selector) {
        const element = document.querySelector(selector);
        return element;
    }

    // Text helper methods:
    // Gets current text from to do
    get _todoText() {
        return this.input.value;
    }
    // Reset the text from to do
    _resetInput() {
        this.input.value = "";
    }

    // Displays the to do list
    displayTodos(todos) {
        // Resets the to do list every time the function gets called
        while (this.toDoList.firstChild) {
            this.toDoList.removeChild(this.toDoList.firstChild);
        }
        // Displays standard message if there are no existing to do's
        if (todos.length === 0) {
            const p = this.createElement("p", "defaultEmptyMessage");
            p.textContent = "No more tasks to do? Add one now if you would like to!";
            this.toDoList.append(p);
        } else {
            // Create a new list item for each to do in the to do's array
            todos.forEach((toDo) => {
                // The list item is going to have the same id as the to do object for easier future references and corelations

                // List item
                const li = this.createElement("li", "listItem");
                li.id = toDo.id;

                // Span element respresenting a container filled with all that it's needed for the to do (radioButton,label, text, edit, save, cancel, delete), basically forming a pack ("toDoPack")
                const toDoPack = this.createElement("span", "toDoPack");
                toDoPack.id = li.id;

                // The parent of the custom radio button
                const customRadioButtonParent = this.createElement("span", "customRadioButtonParent");
                customRadioButtonParent.id = "customRadioButtonParent";

                // The child of the custom radio button
                // Custom Radio button for simulating a button which will be linked to button
                const customRadioButton = this.createElement("span", "customRadioButton");
                customRadioButton.id = "customRadioButton";

                // Radio button for marking to do completion
                const radioButton = this.createElement("input", "radioButton");
                radioButton.type = "radio";
                radioButton.id = "radioButton";
                radioButton.checked = toDo.complete;

                // Input element for "editing mode"
                const editingToDoBox = this.createElement("input", "editableBox");
                editingToDoBox.type = "text";
                editingToDoBox.id = "editingTextBox";
                editingToDoBox.style.display = "none";
                editingToDoBox.classList.add("textBoxes");

                // Span element storing the to do text
                const defaultToDoBox = this.createElement("span", "defaultBox");
                defaultToDoBox.id = "defaultTextBox";
                defaultToDoBox.style.display = "inline";
                defaultToDoBox.classList.add("textBoxes");

                // Logic for how to display the to do text
                defaultToDoBox.textContent = toDo.text;

                // A save button for user to save the new text and exit the "editing mode"
                const saveButton = this.createElement("button", "save");
                saveButton.id = "save";
                saveButton.textContent = "Save";
                saveButton.style.display = "none";
                saveButton.classList.add("buttons");

                // A cancel button for user to cancel the "editing mode"
                const cancelButton = this.createElement("button", "cancel");
                cancelButton.id = "cancel";
                cancelButton.textContent = "Cancel";
                cancelButton.style.display = "none";
                cancelButton.classList.add("buttons");

                // A edit buton for user to edit the text
                const editButton = this.createElement("button", "edit");
                editButton.id = "edit";
                editButton.textContent = "✏️";
                editButton.style.display = "inline-block";
                editButton.classList.add("buttons");

                // Delete to do buton
                const deleteButton = this.createElement("button", "delete");
                deleteButton.id = "delete";
                deleteButton.textContent = "🗑️";
                deleteButton.classList.add("buttons");

                // Append the custom radio button to the parent
                customRadioButtonParent.append(customRadioButton);

                // Appends the childs to the "to do pack" item
                toDoPack.append(customRadioButtonParent, radioButton, editingToDoBox, defaultToDoBox, saveButton, cancelButton, editButton, deleteButton);

                // Appends the "to do pack" to the list item
                li.append(toDoPack);

                //Appends the list item to the unordered list
                this.toDoList.append(li);
            });
        }
    }

    // Bindings

    // Binding listening for the submit event on the form
    bindAddToDo(handler) {
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();
            if (this._todoText) {
                handler(this._todoText);
                this._resetInput();
            }
        });
    }
    // Binding listening for click event on the delete button from the unordered list (to do list)
    bindRemoveToDo(handler) {
        this.toDoList.addEventListener("click", (event) => {
            if (event.target.className === "delete buttons") {
                const id = parseInt(event.target.parentElement.id);
                handler(id);
            }
        });
    }
    // Binding listening for a click event on the reset button
    bindResetList(handler) {
        this.resetButton.addEventListener("click", () => {
            handler();
        });
    }
    // Binding listening for a click event on the edit button
    bindEditToDo() {
        this.toDoList.addEventListener("click", (event) => {
            if (event.target.id === "edit") {
                // Locating the specific nodes

                // Needed list item (parent element)
                const parent = event.target.parentElement;
                // Edit button
                const editButton = parent.querySelector("#edit");
                // Save button
                const saveButton = parent.querySelector("#save");
                // Cancel button
                const cancelButton = parent.querySelector("#cancel");
                // Span element (default to do box)
                const defaultToDoBox = parent.querySelector("#defaultTextBox");
                // Input element (editing to do box)
                const editingToDoBox = parent.querySelector("#editingTextBox");

                // Inserting the text from the "default to do box" into the "editing to do box"
                editingToDoBox.value = defaultToDoBox.textContent;

                // Changing the display properties of the elements

                // Edit button
                editButton.style.display = "none";
                // Save button
                saveButton.style.display = "inline-block";
                // Cancel button
                cancelButton.style.display = "inline-block";
                // Input element (editing to do box)
                editingToDoBox.style.display = "inline-block";
                // Span element (default to do box)
                defaultToDoBox.style.display = "none";
            }
        });
    }
    // Binding listening for a click event on the save button
    bindSaveToDo(handler) {
        this.toDoList.addEventListener("click", (event) => {
            if (event.target.id === "save") {
                // Locating the needes nodes

                // Stiu ca pot sa o scriu dintr-o bucata direct in handler, dar am zis sa o gandesc asa pentru un coder nou de exemplu sa vada fiecare pas si sa i fie mai usor (sa-mi zici daca e ok sau daca sa o las dintr-o bucata direct in handler te rog)

                // List item (parent element)
                const parent = event.target.parentElement;
                // Input element (editing to do box)
                const editingToDoBox = parent.querySelector("#editingTextBox");

                // Handler call
                handler(parent.id, editingToDoBox.value);
            }
        });
    }
    // Binding listening for a click event on the cancel button
    bindCancelToDo(handler) {
        this.toDoList.addEventListener("click", (event) => {
            if (event.target.id === "cancel") {
                // Locating the needes nodes

                // Stiu ca pot sa o scriu dintr-o bucata direct in handler, dar am zis sa o gandesc asa pentru un coder nou de exemplu sa vada fiecare pas si sa i fie mai usor (sa-mi zici daca e ok sau daca sa o las dintr-o bucata direct in handler te rog)

                // List item (parent element)
                const parent = event.target.parentElement;
                // Span element (default to do box)
                const defaultTextBox = parent.querySelector("#defaultTextBox");

                // Handler call
                handler(parent.id, defaultTextBox.textContent);
            }
        });
    }
    // Binding listening for a "toggle" on the custom radio button
    bindToggleToDo(handler) {
        this.toDoList.addEventListener("click", (event) => {
            if (event.target.id === "customRadioButton") {
                // The parent button
                const parentButton = event.target.parentElement;
                // Changes on parent button style
                parentButton.style.background = "gray";
                parentButton.style.border = "0px";

                //The To Do Task
                const toDoTask = parentButton.parentElement;
                // Changes on To Do Task style
                toDoTask.style.background = "white";
                toDoTask.style.filter = "grayscale(100%)";
                toDoTask.style.color = "gray";

                // The default textBox
                const defaultTextBox = toDoTask.querySelector("#defaultTextBox");
                // Changes on default textBox style
                defaultTextBox.style.textDecoration = "line-through";

                // Handler1 call
                const id = parseInt(toDoTask.id);
                const removeToDo = new Promise(function (resolve) {
                    setTimeout(() => {
                        resolve(handler(id));
                    }, 1000);
                });
            }
        });
    }
}

// To do list app object initialization
const app = new Controller(new Model(), new View());
