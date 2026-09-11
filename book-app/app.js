const form = document.querySelector('#add-form');
const titleInput = document.querySelector('#title-input');
const authorInput = document.querySelector('#author-input');
const ratingInput = document.querySelector('#rating-input');
const tip = document.querySelector('#tip');
const list = document.querySelector('#book-list');
const searchInput = document.querySelector('#search-input');

let books = [];
let keyword = '';
let editingId = null;

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
    if (editingId === book.id) {
      // 编辑模式：行内输入框，预填原值
      li.className = 'edit-row';
      const t = document.createElement('input');
      t.type = 'text'; t.value = book.title;
      const a = document.createElement('input');
      a.type = 'text'; a.value = book.author;
      const r = document.createElement('input');
      r.type = 'number'; r.min = '1'; r.max = '5'; r.value = book.rating;
      const saveBtn = document.createElement('button');
      saveBtn.textContent = '保存';
      saveBtn.onclick = () => {
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
        render();
      };
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = '取消';
      cancelBtn.onclick = () => {
        editingId = null;
        tip.textContent = '';
        render();
      };
      li.appendChild(t);
      li.appendChild(a);
      li.appendChild(r);
      li.appendChild(saveBtn);
      li.appendChild(cancelBtn);
    } else {
      // 浏览模式：展示书名、作者、星级 + 操作按钮
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
      editBtn.onclick = () => {
        editingId = book.id;
        render();
      };
      const delBtn = document.createElement('button');
      delBtn.textContent = '删除';
      delBtn.onclick = () => {
        const idx = books.findIndex(b => b.id === book.id);
        if (idx !== -1) {
          books.splice(idx, 1);
          render();
        }
      };
      ops.appendChild(editBtn);
      ops.appendChild(delBtn);
      li.appendChild(info);
      li.appendChild(ops);
    }
    list.appendChild(li);
  });
};

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
