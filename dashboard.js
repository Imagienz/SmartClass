let currentDate = new Date(); // วันปัจจุบันสำหรับปฏิทิน
let maxRows = 10;
let defaultRows = 7;

// รายชื่อวันภาษาไทย
const daysThai = ["วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์"];

document.addEventListener("DOMContentLoaded", () => {
    loadTheme(); // ดึงค่าโหมดที่ผู้ใช้เคยเลือกไว้
    initSchedule();
    loadTasks();
    renderCalendar();
});

// ==========================================
// 1. ระบบตารางเรียนประจำวัน
// ==========================================
function initSchedule() {
    const todayIndex = new Date().getDay();
    const todayName = daysThai[todayIndex];

    // อัปเดตชื่อวันในส่วนหัว
    document.getElementById("current-day-name").textContent = todayName;
    document.getElementById("today-column-header").textContent = `${todayName} (วิชาเรียน)`;

    // โหลดข้อมูลตารางเรียนเดิม หรือสร้างค่าเริ่มต้น 7 แถว
    let savedSchedule = JSON.parse(localStorage.getItem("smartclass_schedule")) || [];
    
    if (savedSchedule.length === 0) {
        for (let i = 0; i < defaultRows; i++) {
            savedSchedule.push({
                startTime: "08:30",
                endTime: "09:30",
                subject: ""
            });
        }
        localStorage.setItem("smartclass_schedule", JSON.stringify(savedSchedule));
    }

    renderSchedule(savedSchedule);
}

function renderSchedule(scheduleData) {
    const tbody = document.getElementById("schedule-body");
    tbody.innerHTML = "";

    scheduleData.forEach((row, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>
                <div class="time-select-group">
                    <input type="time" value="${row.startTime}" onchange="updateSchedule(${index}, 'startTime', this.value)">
                    <span>ถึง</span>
                    <input type="time" value="${row.endTime}" onchange="updateSchedule(${index}, 'endTime', this.value)">
                </div>
            </td>
            <td>
                <input type="text" class="subject-input" placeholder="กรอกวิชาเรียน..." value="${row.subject}" onchange="updateSchedule(${index}, 'subject', this.value)">
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateSchedule(index, field, value) {
    let scheduleData = JSON.parse(localStorage.getItem("smartclass_schedule")) || [];
    if (scheduleData[index]) {
        scheduleData[index][field] = value;
        localStorage.setItem("smartclass_schedule", JSON.stringify(scheduleData));
    }
}

function addRow() {
    let scheduleData = JSON.parse(localStorage.getItem("smartclass_schedule")) || [];
    if (scheduleData.length < maxRows) {
        scheduleData.push({ startTime: "12:00", endTime: "13:00", subject: "" });
        localStorage.setItem("smartclass_schedule", JSON.stringify(scheduleData));
        renderSchedule(scheduleData);
    } else {
        alert("สามารถเพิ่มแถวเรียนได้สูงสุด 10 คาบเท่านั้น");
    }
}

// เพิ่มฟังก์ชันสำหรับลบแถวล่าสุดออก
function deleteRow() {
    let scheduleData = JSON.parse(localStorage.getItem("smartclass_schedule")) || [];
    if (scheduleData.length > 1) { // กำหนดขั้นต่ำไว้ที่ 1 แถว
        scheduleData.pop(); // ลบแถวล่าสุดออก
        localStorage.setItem("smartclass_schedule", JSON.stringify(scheduleData));
        renderSchedule(scheduleData);
    } else {
        alert("ต้องมีตารางเรียนอย่างน้อย 1 แถวครับ");
    }
}

// ==========================================
// 2. ระบบจัดการงาน (Tasks)
// ==========================================
function addTask(event) {
    event.preventDefault();
    const subject = document.getElementById("task-subject").value;
    const title = document.getElementById("task-title").value;
    const datetime = document.getElementById("task-datetime").value;

    const task = {
        id: Date.now(),
        subject: subject,
        title: title,
        datetime: datetime,
        completed: false
    };

    let tasks = getTasksFromStorage();
    tasks.push(task);
    localStorage.setItem("smartclass_tasks", JSON.stringify(tasks));

    document.getElementById("task-form").reset();
    renderTasks();
    renderCalendar(); // อัปเดตปฏิทินทันทีที่มีการเพิ่มงาน
}

function getTasksFromStorage() {
    return JSON.parse(localStorage.getItem("smartclass_tasks")) || [];
}

function renderTasks() {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";
    const tasks = getTasksFromStorage();

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = `task-item ${task.completed ? "completed" : ""}`;

        const dateFormatted = new Date(task.datetime).toLocaleString("th-TH", {
            dateStyle: "short",
            timeStyle: "short"
        });

        li.innerHTML = `
            <div class="task-info">
                <span class="badge">${task.subject}</span>
                <span class="title">${task.title}</span>
                <span class="due-date">⏰ ${dateFormatted}</span>
            </div>
            <div class="task-actions">
                ${!task.completed 
                    ? `<button class="btn-complete" onclick="toggleTask(${task.id})">เสร็จสิ้น</button>` 
                    : `<button class="btn-undo" onclick="toggleTask(${task.id})">ทำอีกครั้ง</button>`
                }
                <button class="btn-delete" onclick="deleteTask(${task.id})">ยกเลิกงาน</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

function toggleTask(id) {
    let tasks = getTasksFromStorage();
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.completed = !task.completed;
        }
        return task;
    });
    localStorage.setItem("smartclass_tasks", JSON.stringify(tasks));
    renderTasks();
    renderCalendar();
}

function deleteTask(id) {
    let tasks = getTasksFromStorage();
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem("smartclass_tasks", JSON.stringify(tasks));
    renderTasks();
    renderCalendar();
}

function loadTasks() {
    renderTasks();
}

function logout() {
    localStorage.removeItem("userLoggedIn");
    window.location.href = "index.html";
}

// ==========================================
// 3. ระบบปฏิทินพร้อมไฮไลท์สีแดงตรงวันส่งงาน
// ==========================================
function renderCalendar() {
    const monthYearText = document.getElementById("calendar-month-year");
    const calendarDays = document.getElementById("calendar-days");
    calendarDays.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNamesThai = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    monthYearText.textContent = `${monthNamesThai[month]} ${year + 543}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    // ดึงวันที่มีการบ้านค้างอยู่ (ยังไม่เสร็จสิ้น)
    const tasks = getTasksFromStorage();
    const taskDates = tasks
        .filter(t => !t.completed)
        .map(t => {
            const d = new Date(t.datetime);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        });

    // ช่องว่างก่อนวันแรกของเดือน
    for (let x = 0; x < firstDayIndex; x++) {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "calendar-day empty";
        calendarDays.appendChild(emptyDiv);
    }

    // ใส่วันที่ในเดือน
    for (let i = 1; i <= lastDate; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "calendar-day";
        dayDiv.textContent = i;

        const currentCheckStr = `${year}-${month}-${i}`;

        // หากวันตรงกับกำหนดส่งงาน ให้ไฮไลท์สีแดง
        if (taskDates.includes(currentCheckStr)) {
            dayDiv.classList.add("has-task-highlight");
            dayDiv.title = "มีงานกำหนดส่งวันนี้!";
        }

        calendarDays.appendChild(dayDiv);
    }
}

function changeMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    renderCalendar();
}

// ==========================================
// 4. ระบบจัดการ Dark / Light Mode
// ==========================================
function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle("dark-mode");
    const themeBtn = document.getElementById("theme-btn");

    if (isDarkMode) {
        themeBtn.textContent = "☀️ โหมดสว่าง";
        localStorage.setItem("smartclass_theme", "dark");
    } else {
        themeBtn.textContent = "🌙 โหมดมืด";
        localStorage.setItem("smartclass_theme", "light");
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem("smartclass_theme");
    const themeBtn = document.getElementById("theme-btn");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        if (themeBtn) themeBtn.textContent = "☀️ โหมดสว่าง";
    }
}

// 1. ฟังก์ชันดึงรายชื่อวิชามาใส่ใน Dropdown
function updateSubjectDropdown() {
    const subjectSelect = document.querySelector("#subject-select") || document.querySelector("select"); 
    if (!subjectSelect) return;

    const timetableData = JSON.parse(localStorage.getItem("timetable")) || {};
    const activeSubjects = new Set();
    
    Object.values(timetableData).forEach(daySchedule => {
        if (Array.isArray(daySchedule)) {
            daySchedule.forEach(slot => {
                if (slot && slot.subject && slot.subject.trim() !== "") {
                    activeSubjects.add(slot.subject.trim());
                }
            });
        } else if (typeof daySchedule === 'object' && daySchedule !== null) {
            Object.values(daySchedule).forEach(slot => {
                if (slot && slot.subject && slot.subject.trim() !== "") {
                    activeSubjects.add(slot.subject.trim());
                }
            });
        }
    });

    subjectSelect.innerHTML = '<option value="">-- เลือกวิชา --</option>';

    activeSubjects.forEach(subjectName => {
        const option = document.createElement("option");
        option.value = subjectName;
        option.textContent = subjectName;
        subjectSelect.appendChild(option);
    });
}

// 2. สั่งให้อัปเดตวิชาทันทีเมื่อเปิดหน้าเว็บขึ้นมา
document.addEventListener("DOMContentLoaded", function () {
    updateSubjectDropdown();
});

// 3. (ดักจับจุดที่ 3) อัปเดต Dropdown อัตโนมัติทุกครั้งที่มีการกด Save หรือ Delete ข้อมูลลง localStorage
const originalSetItem = localStorage.setItem;
localStorage.setItem = function (key, value) {
    originalSetItem.apply(this, arguments);
    if (key === "timetable") {
        updateSubjectDropdown(); // อัปเดตรายชื่อวิชาทันทีที่มีการแก้ไขตารางเรียน
    }
};
