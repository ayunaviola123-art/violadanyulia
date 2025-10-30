/* Simple To-Do with localStorage, edit, delete, toggle done, keyboard support */
const STORAGE_KEY = 'todo_tasks_v1';

const q = sel => document.querySelector(sel);
const el = id => document.getElementById(id);

const form = el('task-form');
const input = el('task-input');
const list = el('task-list');
const countEl = el('task-count');
const clearDoneBtn = el('clear-done');
const clearAllBtn = el('clear-all');

let tasks = loadTasks();
render();

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text);
  input.value = '';
  input.focus();
});

clearDoneBtn.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  saveAndRender();
});

clearAllBtn.addEventListener('click', () => {
  if (!confirm('Yakin hapus semua tugas?')) return;
  tasks = [];
  saveAndRender();
});

/* functions */
function uuid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

function addTask(text){
  const t = { id: uuid(), text, done:false, created: Date.now() };
  tasks.unshift(t); // latest on top
  saveAndRender();
}

function toggleDone(id){
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.done = !t.done;
  saveAndRender();
}

function deleteTask(id){
  tasks = tasks.filter(x => x.id !== id);
  saveAndRender();
}

function editTask(id, newText){
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.text = newText;
  saveAndRender();
}

function saveAndRender(){
  saveTasks();
  render();
}

function saveTasks(){
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Gagal menyimpan ke localStorage', err);
  }
}

function loadTasks(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Gagal baca localStorage', err);
    return [];
  }
}

/* Render UI */
function render(){
  list.innerHTML = '';
  if (tasks.length === 0){
    list.innerHTML = `<li class="task empty">Belum ada tugas — tambahkan tugas di atas.</li>`;
  } else {
    tasks.forEach(task => list.appendChild(createTaskNode(task)));
  }
  updateCount();
}

function updateCount(){
  const total = tasks.length;
  const remaining = tasks.filter(t => !t.done).length;
  countEl.textContent = `${remaining} / ${total} tugas belum selesai`;
}

/* Task DOM */
function createTaskNode(task){
  const li = document.createElement('li');
  li.className = 'task';
  li.dataset.id = task.id;

  const left = document.createElement('div');
  left.className = 'left';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = !!task.done;
  checkbox.setAttribute('aria-label', task.done ? 'Batal selesai' : 'Tandai selesai');

  checkbox.addEventListener('change', () => toggleDone(task.id));
  checkbox.addEventListener('keydown', e => {
    if (e.key === 'Enter') toggleDone(task.id);
  });

  const text = document.createElement('div');
  text.className = 'text';
  text.tabIndex = 0;
  text.textContent = task.text;
  if (task.done) text.classList.add('done');

  // double click to edit
  text.addEventListener('dblclick', () => startEdit(task.id, text));
  text.addEventListener('keydown', e => {
    // Enter to start edit, Delete to remove
    if (e.key === 'Enter') startEdit(task.id, text);
    if (e.key === 'Delete') deleteTask(task.id);
  });

  left.appendChild(checkbox);
  left.appendChild(text);

  const actions = document.createElement('div');
  actions.className = 'actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'icon-btn';
  editBtn.title = 'Edit';
  editBtn.innerHTML = '✏️';
  editBtn.addEventListener('click', () => startEdit(task.id, text));

  const delBtn = document.createElement('button');
  delBtn.className = 'icon-btn';
  delBtn.title = 'Hapus';
  delBtn.innerHTML = '🗑️';
  delBtn.addEventListener('click', () => {
    if (confirm('Hapus tugas ini?')) deleteTask(task.id);
  });

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);

  li.appendChild(left);
  li.appendChild(actions);

  return li;
}

/* Edit flow: replace text with input */
function startEdit(id, textNode){
  const current = tasks.find(t => t.id === id);
  if (!current) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.value = current.text;
  input.className = 'edit-input';
  input.style.width = '100%';
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') finishEdit(true);
    if (e.key === 'Escape') finishEdit(false);
  });

  input.addEventListener('blur', () => finishEdit(true));

  const parent = textNode.parentElement;
  parent.replaceChild(input, textNode);
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  function finishEdit(shouldSave){
    if (shouldSave){
      const v = input.value.trim();
      if (v === '') {
        if (confirm('Teks kosong — hapus tugas?')) deleteTask(id);
        else parent.replaceChild(textNode, input);
      } else {
        editTask(id, v);
      }
    } else {
      parent.replaceChild(textNode, input);
    }
  }
}
