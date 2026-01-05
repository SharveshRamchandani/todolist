document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    renderTasks();


    addBtn.addEventListener('click', addTask);

    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    function addTask() {
        const taskText = todoInput.value.trim();

        if (taskText === '') {

            todoInput.placeholder = "Please enter a task!";
            setTimeout(() => todoInput.placeholder = "Add a new task...", 2000);
            return;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false
        };

        tasks.push(newTask);
        saveTasks();


        createTaskElement(newTask, true);

        todoInput.value = '';
        updateEmptyState();


        setTimeout(() => {
            todoList.scrollTop = todoList.scrollHeight;
        }, 10);
    }

    function renderTasks() {
        todoList.innerHTML = '';

        tasks.forEach(task => {
            createTaskElement(task, false);
        });

        updateEmptyState();
    }

    function createTaskElement(task, isNew) {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;



        li.innerHTML = `
            <div class="todo-content" onclick="toggleTask(${task.id})">
                <div class="custom-checkbox">
                    <i class="fas fa-check"></i>
                </div>
                <span class="todo-text">${escapeHtml(task.text)}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id}, event)" aria-label="Delete task">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;

        todoList.appendChild(li);
    }


    window.toggleTask = function (id) {
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            tasks[index].completed = !tasks[index].completed;
            saveTasks();


            const li = document.querySelector(`li[data-id="${id}"]`);
            if (li) {
                li.classList.toggle('completed');
            }
        }
    };

    window.deleteTask = function (id, event) {

        if (event) event.stopPropagation();

        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {

            const li = document.querySelector(`li[data-id="${id}"]`);
            if (li) {
                li.style.animation = 'slideOut 0.3s ease forwards';
                li.addEventListener('animationend', () => {
                    tasks.splice(index, 1);
                    saveTasks();
                    renderTasks();
                });
            } else {

                tasks.splice(index, 1);
                saveTasks();
                renderTasks();
            }
        }
    };

    function updateEmptyState() {
        if (tasks.length === 0) {
            emptyState.classList.add('visible');
        } else {
            emptyState.classList.remove('visible');
        }
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
