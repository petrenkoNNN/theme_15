const API_URL = 'https://sb-film.skillbox.cc/films';
const HEADERS = { email: 'nadyapetrenko5977@gmail.com' };

const filmFormEl = document.querySelector('.film-form');
const filterFormEl = document.querySelector('.filter-form');
const errorEl = document.querySelector('.error');
const deleteAllBtnEl = document.querySelector('.delete-all-btn');
const filmTableBodyEl = document.querySelector('.film-tbody');

const requiredItems = ['title', 'genre', 'releaseYear'];

const validateForm = (formData) => {
  for (let i = 0; i < requiredItems.length; i++) {
    const value = formData.get(requiredItems[i]);

    if (!value || value.trim() === '') {
      errorEl.textContent = 'Заполните все поля: название, жанр и год выпуска.';
      return false;
    }
  }

  errorEl.textContent = '';
  return true;
};

const getFilterParams = () => {
  const params = new URLSearchParams();
  const formData = new FormData(filterFormEl);

  for (let [key, value] of formData) {
    if (value.trim() !== '') {
      params.append(key, value.trim());
    }
  }

  return params;
};

const handleFormSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(filmFormEl);

  if (!validateForm(formData)) {
    return;
  }

  const film = {};

  for (let [key, value] of formData) {
    film[key] = value.trim();
  }

  film.isWatched = formData.has('isWatched');

  if (await addFilm(film)) {
    filmFormEl.reset();
  }
};

const addFilm = async (film) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...HEADERS,
    },
    body: JSON.stringify(film),
  });

    if (!response.ok) {
    const { error } = await response.json();
    errorEl.textContent = error;
    return false;
  }

  renderTable();
  return true;
};

const renderTable = async () => {
  const response = await fetch(`${API_URL}?${getFilterParams()}`, {
    headers: HEADERS,
  });
  const films = await response.json();

  filmTableBodyEl.innerHTML = '';

  films.forEach((film) => {
    const row = document.createElement('tr');
    const values = [
      film.title,
      film.genre,
      film.releaseYear,
      film.isWatched ? 'Да' : 'Нет',
    ];

    values.forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });

    const actionsCell = document.createElement('td');
    actionsCell.innerHTML = `
      <button type="button" class="delete-btn" data-action="delete" data-id="${film.id}">Удалить</button>
    `;
    row.appendChild(actionsCell);

    filmTableBodyEl.appendChild(row);
  });
};

const deleteFilm = async (id) => {
  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: HEADERS,
  });

  renderTable();
};

const deleteAllFilms = async () => {
  await fetch(API_URL, {
    method: 'DELETE',
    headers: HEADERS,
  });

  renderTable();
};

const actionDict = {
  delete: deleteFilm,
};

filmFormEl.addEventListener('submit', handleFormSubmit);
filterFormEl.addEventListener('input', renderTable);
filterFormEl.addEventListener('submit', (e) => e.preventDefault());
deleteAllBtnEl.addEventListener('click', deleteAllFilms);

filmTableBodyEl.addEventListener('click', (e) => {
  const { action, id } = e.target.dataset;

  if (actionDict[action]) {
    actionDict[action](id);
  }
});

renderTable();