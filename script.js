/**
 * To-Do List Application
 * Manages tasks with local storage persistence
 */

class TodoApp {
    constructor() {
        this.tasks = [];
        this.taskIdCounter = 1;
        
        this.initializeElements();
        this.bindEvents();
        this.loadTasks();
        this.render();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.addTaskForm = document.getElementById('addTaskForm');
        this.taskInput = document.getElementById('taskInput');
        this.tasksList = document.getElementById('tasksList');
        this.taskCount = document.getElementById('taskCount');
        this.emptyState = document.getElementById('emptyState');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        this.addTaskForm.addEventListener('submit', (e) => this.handleAddTask(e));
    }

    /**
     * Handle adding a new task
     */
    handleAddTask(event) {
        event.preventDefault();
        
        const taskText = this.taskInput.value.trim();
        if (!taskText) {
            return;
        }

        const newTask = {
            id: this.generateTaskId(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(newTask);
        this.taskInput.value = '';
        this.saveTasks();
        this.render();
        
        // Focus back to input for better UX
        this.taskInput.focus();
    }

    /**
     * Generate unique task ID
     */
    generateTaskId() {
        return this.taskIdCounter++;
    }

    /**
     * Toggle task completion status
     */
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    /**
     * Delete a task
     */
    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            this.tasks.splice(taskIndex, 1);
            this.saveTasks();
            this.render();
        }
    }

    /**
     * Save tasks to local storage
     */
    saveTasks() {
        try {
            const dataToSave = {
                tasks: this.tasks,
                taskIdCounter: this.taskIdCounter
            };
            localStorage.setItem('todoApp_data', JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Failed to save tasks to localStorage:', error);
        }
    }

    /**
     * Load tasks from local storage
     */
    loadTasks() {
        try {
            const savedData = localStorage.getItem('todoApp_data');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                this.tasks = parsedData.tasks || [];
                this.taskIdCounter = parsedData.taskIdCounter || 1;
                
                // Ensure taskIdCounter is always higher than existing task IDs
                const maxId = Math.max(...this.tasks.map(t => t.id), 0);
                this.taskIdCounter = Math.max(this.taskIdCounter, maxId + 1);
            }
        } catch (error) {
            console.error('Failed to load tasks from localStorage:', error);
            this.tasks = [];
            this.taskIdCounter = 1;
        }
    }

    /**
     * Render the task list and update UI
     */
    render() {
        this.renderTasks();
        this.updateTaskCount();
        this.toggleEmptyState();
    }

    /**
     * Render all tasks in the DOM
     */
    renderTasks() {
        this.tasksList.innerHTML = '';
        
        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.tasksList.appendChild(taskElement);
        });
    }

    /**
     * Create a single task element
     */
    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.setAttribute('data-task-id', task.id);

        li.innerHTML = `
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}"
            >
            <span class="task-text">${this.escapeHtml(task.text)}</span>
            <button 
                class="delete-button" 
                aria-label="Delete task"
                title="Delete task"
            >
                🗑️
            </button>
        `;

        // Bind events for this task
        const checkbox = li.querySelector('.task-checkbox');
        const deleteButton = li.querySelector('.delete-button');

        checkbox.addEventListener('change', () => this.toggleTask(task.id));
        deleteButton.addEventListener('click', () => this.deleteTask(task.id));

        return li;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Update the task count display
     */
    updateTaskCount() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        
        if (totalTasks === 0) {
            this.taskCount.textContent = '0';
        } else {
            this.taskCount.textContent = `${completedTasks}/${totalTasks}`;
        }
    }

    /**
     * Show/hide empty state based on task count
     */
    toggleEmptyState() {
        if (this.tasks.length === 0) {
            this.emptyState.classList.add('show');
            this.tasksList.style.display = 'none';
        } else {
            this.emptyState.classList.remove('show');
            this.tasksList.style.display = 'block';
        }
    }

    /**
     * Get app statistics
     */
    getStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        return { total, completed, pending };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Focus on input with Ctrl/Cmd + /
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        document.getElementById('taskInput').focus();
    }
}); 