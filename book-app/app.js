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
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="4">${books.length === 0 ? '暂无图书' : '没有匹配的图书'}</td>`;
    list.appendChild(tr);
    return;
  }
  shown.forEach(book => {
    const tr = document.createElement('tr');
    // data-id 用字符串存储，比较时统一用 Number() 转换
    tr.dataset.id = book.id;
    if (editingId === book.id) {
      // 编辑模式：输入框放 td，预填原值；按钮带 data-action 供父级委托识别
      tr.className = 'edit-row';
      tr.innerHTML = `
        <td><input type="text" class="edit-title" value="${book.title}"></td>
        <td><input type="text" class="edit-author" value="${book.author}"></td>
        <td><input type="number" class="edit-rating" min="1" max="5" value="${book.rating}"></td>
        <td><button data-action="save">保存</button> <button data-action="cancel">取消</button></td>
      `;
    } else {
      // 浏览模式：书名/作者/评分/操作 分列展示，文本可被鼠标拖选复制
      const tdTitle = document.createElement('td');
      tdTitle.textContent = book.title;
      const tdAuthor = document.createElement('td');
      tdAuthor.textContent = book.author;
      const tdRating = document.createElement('td');
      tdRating.className = 'stars';
      tdRating.textContent = '★'.repeat(book.rating);
      const tdOps = document.createElement('td');
      tdOps.className = 'ops';
      const editBtn = document.createElement('button');
      editBtn.textContent = '编辑';
      editBtn.dataset.action = 'edit';
      const delBtn = document.createElement('button');
      delBtn.textContent = '删除';
      delBtn.dataset.action = 'delete';
      tdOps.append(editBtn, delBtn);
      tr.append(tdTitle, tdAuthor, tdRating, tdOps);
    }
    list.appendChild(tr);
  });
};

// 事件委托：tbody 上单个 click 监听器，靠 data-action 分发
// 原理：click 冒泡到 tbody，用 e.target.closest('button') 定位按钮，读 dataset.action 决定动作
list.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;                       // 点到 td 文本或行空白处，忽略
  const action = btn.dataset.action;
  const tr = btn.closest('tr');
  const id = Number(tr.dataset.id);       // dataset 存字符串，转回数字与 book.id 对齐
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
    // 编辑模式下输入框是 td 的子元素，按 class 查询取值
    const t = tr.querySelector('.edit-title');
    const a = tr.querySelector('.edit-author');
    const r = tr.querySelector('.edit-rating');
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
