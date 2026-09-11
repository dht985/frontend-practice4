const form = document.querySelector('#add-form');
const titleInput = document.querySelector('#title-input');
const authorInput = document.querySelector('#author-input');
const ratingInput = document.querySelector('#rating-input');
const tip = document.querySelector('#tip');
const list = document.querySelector('#book-list');

let books = [];

const render = () => {
  list.innerHTML = '';
  if (books.length === 0) {
    const li = document.createElement('li');
    li.textContent = '暂无图书';
    list.appendChild(li);
    return;
  }
  books.forEach(book => {
    const li = document.createElement('li');
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
    li.appendChild(info);
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

render();
