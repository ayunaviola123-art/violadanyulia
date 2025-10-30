const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

// Load tasks dari localStorage
document.addEventListener("DOMContentLoaded", loadTasks);

function loadTasks() {
  const saved = JSON.parse(localStorage.getItem("tasks")) || [];
  saved.forEach(task => addTask(task.text, task.done));
}

addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  if (text === "") return alert("Tulis dulu kegiatannya 💬");
  addTask(text);
  saveTasks();
  taskInput.value = "";
});

function addTask(text, done = false) {
  const li = document.createElement("li");
  li.innerHTML = `
    <span class="task-text ${done ? "completed" : ""}">${text}</span>
    <button class="delete-btn">Hapus</button>
  `;

  const textSpan = li.querySelector(".task-text");
  const delBtn = li.querySelector(".delete-btn");

  textSpan.addEventListener("click", () => {
    textSpan.classList.toggle("completed");
    saveTasks();
  });

  delBtn.addEventListener("click", () => {
    li.remove();
    saveTasks();
  });

  taskList.appendChild(li);
}

function saveTasks() {
  const tasks = [];
  document.querySelectorAll("#taskList li").forEach(li => {
    tasks.push({
      text: li.querySelector(".task-text").textContent,
      done: li.querySelector(".task-text").classList.contains("completed")
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
