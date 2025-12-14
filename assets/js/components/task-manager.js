
let allTasks = [];
let currentTask = null;
let currentFilter = "ALL";

// get tasks from localStorage
function getAllTasks() {
    const saved = localStorage.getItem("tasks");

    if (!saved || saved === "undefined") {
        return [];
    }

    try {
        return JSON.parse(saved);
    } catch (e) {
        console.error("Invalid JSON in localStorage:", saved);
        localStorage.removeItem("tasks");
        return [];
    }
}

// save task when after update
function saveTasks(tasks) {
    if (!tasks || tasks === "undefined") {
        console.error("tasks is null ", tasks);
    }

    try {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (e) {
        console.error("Save tasks in localStorage failed:", tasks);

    }
};

// render tasks
function renderTasks(tasks) {
    const list = document.getElementById("taskList");
    list.innerHTML = "";
    if (!tasks.length) {
        list.innerHTML = `<p style='text-align: center; color: #777'>Không có task nào 😄</p>`;
    }

    tasks.forEach(task => {
        const cardWrapper = document.createElement("div");
        cardWrapper.className = "task__card-wrapper";
        cardWrapper.innerHTML = `
            <div class="task__card ${task.status.toLowerCase().replace("_", "-")}">
                <img src="./assets/img/card/thumbnail-1.png" alt="thumbnail" class="task__card-thumbnail">
                <div class="task__card-info">
                    <h3 class="task__card-title">${task.title}</h3>
                    <p class="task__card-desc">${task.desc}</p>
                </div>
                <div class="task__card-status">
                    <span class="task__card-status-title">${task.status.toUpperCase().replace("_", "-")}</span>
                    <span class="task__card-status-due-time">🕒 15:35</span>
                </div>
            </div>
        `;
        list.appendChild(cardWrapper);
        cardWrapper.addEventListener("click", () => openTaskDetail(task.id))
    });

}

// apply filter
function applyFilters() {
    const keyword = document.getElementById("searchTask").value.toLowerCase();
    const filtered = allTasks.filter(task => {
        const matchKeyword = task.title.toLowerCase().includes(keyword) || task.desc.toLowerCase().includes(keyword);
        const matchStatus = currentFilter === "ALL" ? true : task.status === currentFilter;
        return matchKeyword && matchStatus;
    })
    renderTasks(filtered);
}


const overlayTask = document.getElementById("overlayDetail");
const popupDetail = document.getElementById("popupDetail");
const markDone = document.getElementById("markDone");
const taskTitle = document.getElementById("popupTaskTitle");
const taskDesc = document.getElementById("popupTaskDesc");
const taskStatus = document.getElementById("popupTaskStatus");
const taskTDueTime = document.getElementById("popupTaskDueTime");
// open task detail
function openTaskDetail(taskId) {
    const task = allTasks.find(task => task.id === taskId);
    currentTask = task;
    taskTitle.innerText = task.title;
    taskDesc.innerText = task.desc;
    taskStatus.innerText = task.status;
    taskTDueTime.innerText = task.dueTime;
    markDone.style.display = task.status === "COMPLETED" ? "none" : "inline-block";
    document.getElementById("updateDetail").style.display = task.status === "COMPLETED" ? "none" : "inline-block";

    overlayDetail.classList.remove("hide");
    popupDetail.classList.remove("closing");
    overlayDetail.classList.add("show");
}

// close popup
document.getElementById("popupTaskCloseBtn").addEventListener("click", () => closePopup(popupDetail, overlayDetail));

function closePopup(popup, overlay) {
    popup.classList.add("closing");
    overlay.classList.remove("show");
    overlay.classList.add("hide");
    // sau khi animation đóng xong → ẩn overlay
    setTimeout(() => {
        overlay.classList.remove('hide');
    }, 300); // đúng bằng thời gian animation
}

// make completed
markDone.addEventListener("click", () => {
    currentTask.status = "COMPLETED";
    saveTasks();
    document.getElementById("popupTaskCloseBtn").click();
    renderTasks(allTasks);
});


// filter buttons
const filterBtns = document.querySelectorAll(".task__filter-btn");
filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filterBtns.forEach(btn => btn.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.status;
        applyFilters();
    });
});



// handle update task
const overlayUpdate = document.getElementById("overlayUpdate");
const updateTitle = document.getElementById("updateTitle");
const updateDesc = document.getElementById("updateDesc");
const updateStatus = document.getElementById("updateStatus");
const updateDueTime = document.getElementById("updateDueTime");
function openUpdateForm() {
    const task = allTasks.find(t => t.id === currentTask.id);
    overlayDetail.classList.remove("show");

    overlayUpdate.classList.remove("hide");
    popupDetail.classList.remove("closing")
    overlayUpdate.classList.add("show");

    updateTitle.value = task.title;
    updateDesc.value = task.desc;
    updateStatus.value = task.status;;
    updateDueTime.value = task.dueTime;
}

document.getElementById("updateCloseBtn").addEventListener("click", () => {
    closePopup(popupDetail, overlayUpdate);
});

const updateForm = document.getElementById("taskUpdateForm");
updateForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentTask) return;
    currentTask.title = updateTitle.value;
    currentTask.desc = updateDesc.value;
    currentTask.status = updateStatus.value;
    currentTask.dueTime = updateDueTime.value;
    document.getElementById("updateCloseBtn").click();
    saveTasks();
    renderTasks(allTasks);
})


// add task
const addTaskBtn = document.getElementById("addTaskBtn");
const overlayCreate = document.getElementById("overlayCreate");
addTaskBtn.addEventListener("click", () => {
    overlayCreate.classList.remove("hide");
    popupDetail.classList.remove("closing")
    overlayCreate.classList.add("show");
})

document.getElementById("addCloseBtn").addEventListener("click", () => closePopup(popupDetail, overlayCreate));


document.getElementById("taskCreateForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("createTitle").value;
    const desc = document.getElementById("createDesc").value;
    const status = document.getElementById("createStatus").value;
    const dueTime = document.getElementById("createDueTime").value;
    const id = allTasks.length + 1;
    const task = {
        'id': id,
        'title': title,
        'desc': desc,
        'status': status,
        'dueTime': dueTime
    }

    document.getElementById("addCloseBtn").click();

    allTasks.push(task);
    saveTasks();
    renderTasks(allTasks);
});


// delete task
const overlayDelete = document.getElementById("overlayDelete");

function openDeleteForm() {
    const task = allTasks.find(t => t.id === currentTask.id);
    overlayDetail.classList.remove("show");

    overlayDelete.classList.remove("hide");
    popupDetail.classList.remove("closing")
    overlayDelete.classList.add("show");
}

document.getElementById("deleteCloseBtn").addEventListener("click", () => {
    closePopup(popupDetail, overlayDelete);
});

document.getElementById("taskDeleteForm").addEventListener("submit", (e) => {
    e.preventDefault();

    allTasks = allTasks.filter(t => t.id !== currentTask.id);
    document.getElementById("deleteCloseBtn").click();
    saveTasks();
    renderTasks(allTasks);
})



// init tasks
allTasks = getAllTasks();

if (allTasks.length === 0) {
    allTasks = [
        { 'id': 1, 'title': 'Berand Nischal’s Birthday Party', 'desc': 'Buy gifts on the way and pick up cake from the bakery. (6 PM | Fresh Elements).....', 'status': "IN_PROGRESS", 'dueTime': '15:30' },
        { 'id': 2, 'title': 'Attend Nischal’s Birthday Party', 'desc': 'Buy gifts on the way and pick up cake from the bakery. (6 PM | Fresh Elements).....', 'status': "COMPLETED", 'dueTime': '16:35' },
        { 'id': 3, 'title': 'Attend Nischal’s Birthday Party', 'desc': 'Buy gifts on the way and pick up cake from the bakery. (6 PM | Fresh Elements).....', 'status': "COMPLETED", 'dueTime': '09:55' },
        { 'id': 4, 'title': 'Attend Nischal’s Birthday Party', 'desc': 'Buy gifts on the way and pick up cake from the bakery. (6 PM | Fresh Elements).....', 'status': "COMPLETED", 'dueTime': '10:20' },
        { 'id': 5, 'title': 'Attend Nischal’s Birthday Party', 'desc': 'Buy gifts on the way and pick up cake from the bakery. (6 PM | Fresh Elements).....', 'status': "PENDING", 'dueTime': '15:35' },
        { 'id': 6, 'title': 'Attend Nischal’s Birthday Party', 'desc': 'Buy gifts on the way and pick up cake from the bakery. (6 PM | Fresh Elements).....', 'status': "PENDING", 'dueTime': '15:35' },
        { 'id': 7, 'title': 'Attend Nischal’s Birthday Party', 'desc': 'Buy gifts on the way and pick up cake from the bakery. (6 PM | Fresh Elements).....', 'status': "PENDING", 'dueTime': '15:35' },
        { 'id': 8, 'title': 'Attend Nischal’s Birthday Party', 'desc': 'Buy gifts on the way and pick up cake from the bakery. (6 PM | Fresh Elements).....', 'status': "PENDING", 'dueTime': '15:35' },
        { 'id': 9, 'title': 'Attend Nischal’s Birthday Party', 'desc': 'Buy gifts on the way and pick up cake from the bakery. (6 PM | Fresh Elements).....', 'status': "PENDING", 'dueTime': '15:35' },
    ];

}




document.getElementById("searchTask").addEventListener("input", applyFilters)
saveTasks(allTasks);

// applyFilters();

renderTasks(allTasks);
