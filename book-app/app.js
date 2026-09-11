const form = document.querySelector('#add-form');
const titleInput = document.querySelector('#title-input');
const authorInput = document.querySelector('#author-input');
const ratingInput = document.querySelector('#rating-input');
const tip = document.querySelector('#tip');
const list = document.querySelector('#book-list');
const searchInput = document.querySelector('#search-input');

// 恢复：首次访问 localStorage.getItem 返回 null，用 || '[]' 兜底得空数组
let books = JSON.parse(localStorage.getItem('books') || '[]');
let keyword = '';
let editingId = null;

const save = () => localStorage.setItem('books', JSON.stringify(books));

const render = () => {
  list.innerHTML = '';
  const shown = books.filter(b => {
    if (!keyword) return true;
    const kw = keyword.toLowerCase();
    return b.title.toLowerCase().includes(kw) || b.author.toLowerCase().includes(kw);
  });
  if (shown.length === 0) {
    const li = document.createElement('li');
    li.textContent = books.length === 0 ? '暂无图书' : '没有匹配的图书';
    list.appendChild(li);
    return;
  }
  shown.forEach(book => {
    const li = document.createElement('li');
    // data-id 用字符串存储，比较时统一用 String() 转换
    li.dataset.id = book.id;
    if (editingId === book.id) {
      // 编辑模式：行内输入框，预填原值；按钮带 data-action 供父级委托识别
      li.className = 'edit-row';
      li.innerHTML = `
        <input type="text" class="edit-title" value="${book.title}">
        <input type="text" class="edit-author" value="${book.author}">
        <input type="number" class="edit-rating" min="1" max="5" value="${book.rating}">
        <button data-action="save">保存</button>
        <button data-action="cancel">取消</button>
      `;
    } else {
      // 浏览模式：信息 + 操作按钮（无 onclick，靠父级 ul 委托）
      const info = document.createElement('span');
      info.className = 'info';
      info.textContent = book.title;
      const meta = document.createElement('span');
      meta.className = 'meta';
      meta.textContent = ` — ${book.author} `;
      const stars = document.createElement('span');
      stars.className = 'stars';
      stars.textContent = '★'.repeat(book.rating);
      info.appendChild(meta);
      info.appendChild(stars);
      const ops = document.createElement('span');
      ops.className = 'ops';
      const editBtn = document.createElement('button');
      editBtn.textContent = '编辑';
      editBtn.dataset.action = 'edit';
      const delBtn = document.createElement('button');
      delBtn.textContent = '删除';
      delBtn.dataset.action = 'delete';
      ops.appendChild(editBtn);
      ops.appendChild(delBtn);
      li.appendChild(info);
      li.appendChild(ops);
    }
    list.appendChild(li);
  });
};

// 事件委托：ul 上单个 click 监听器，靠 data-action 分发
// 原理：click 冒泡到 ul，用 e.target.closest('button') 定位按钮，读 dataset.action 决定动作
list.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;                       // 点到 li 空白处或文本，忽略
  const action = btn.dataset.action;
  const li = btn.closest('li');
  const id = Number(li.dataset.id);       // dataset 存字符串，转回数字与 book.id 对齐
  const book = books.find(b => b.id === id);
  if (!book) return;

  if (action === 'edit') {
    editingId = book.id;
    render();
  } else if (action === 'delete') {
    const idx = books.findIndex(b => b.id === id);
    if (idx !== -1) {
      books.splice(idx, 1);
      save();
      render();
    }
  } else if (action === 'save') {
    // 编辑模式下输入框是 li 的子元素，按 class 查询取值
    const t = li.querySelector('.edit-title');
    const a = li.querySelector('.edit-author');
    const r = li.querySelector('.edit-rating');
    const nt = t.value.trim();
    const na = a.value.trim();
    const nr = Number(r.value);
    if (!nt || !na) {
      tip.textContent = '书名和作者不能为空';
      return;
    }
    if (!Number.isInteger(nr) || nr < 1 || nr > 5) {
      tip.textContent = '评分必须是1到5的整数';
      return;
    }
    book.title = nt;
    book.author = na;
    book.rating = nr;
    editingId = null;
    tip.textContent = '';
    save();
    render();
  } else if (action === 'cancel') {
    editingId = null;
    tip.textContent = '';
    render();
  }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const rating = Number(ratingInput.value);
  if (!title || !author) {
    tip.textContent = '书名和作者不能为空';
    return;
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    tip.textContent = '评分必须是1到5的整数';
    return;
  }
  books.push({ id: Date.now(), title, author, rating });
  save();
  tip.textContent = '';
  titleInput.value = '';
  authorInput.value = '';
  ratingInput.value = '';
  render();
});

searchInput.addEventListener('input', (e) => {
  keyword = e.target.value.trim();
  render();
});

render();
