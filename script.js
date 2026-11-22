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
  const formData = new FormData(filterFormEl);

  return Array.from(formData).reduce((params, [key, value]) => {
    if (value.trim() !== '') {
      params.append(key, value.trim());
    }

    return params;
  }, new URLSearchParams());
};

const handleFormSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(filmFormEl);

  if (!validateForm(formData)) {
    return;
  }

   const film = Object.fromEntries(
    Array.from(formData, ([key, value]) => [key, value.trim()])
  );

  film.isWatched = formData.has('isWatched');

   const isAdded = await addFilm(film);

  if (isAdded) {
    filmFormEl.reset();
  }
};

const addFilm = (film) => {
  return fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...HEADERS,
    },
    body: JSON.stringify(film),
  }).then((response) => {
    if (response.ok) {
      renderTable();
      return true;
    }

    return response.json().then(({ error }) => {
      errorEl.textContent = error;
      return false;
    });
  });
};

const renderTable = () => {
  return fetch(`${API_URL}?${getFilterParams()}`, { headers: HEADERS })
    .then((response) => response.json())
    .then((films) => {
      filmTableBodyEl.innerHTML = '';

      films.forEach(({ id, title, genre, releaseYear, isWatched }) => {
        const row = document.createElement('tr');
        const values = [title, genre, releaseYear, isWatched ? 'Да' : 'Нет'];

        values.forEach((value) => {
          const cell = document.createElement('td');
          cell.textContent = value;
          row.appendChild(cell);
        });

        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
          <button type="button" class="delete-btn" data-action="delete" data-id="${id}">Удалить</button>
        `;
        row.appendChild(actionsCell);

        filmTableBodyEl.appendChild(row);
      });
    });
};

const deleteFilm = (id) => {
  fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: HEADERS })
    .then(() => renderTable());
};

const deleteAllFilms = () => {
  fetch(API_URL, { method: 'DELETE', headers: HEADERS })
    .then(() => renderTable());
};

const actionDict = {
  delete: deleteFilm,
};

filmFormEl.addEventListener('submit', handleFormSubmit);
filterFormEl.addEventListener('input', renderTable);
deleteAllBtnEl.addEventListener('click', deleteAllFilms);

filmTableBodyEl.addEventListener('click', (e) => {
  const { action, id } = e.target.dataset;

  if (actionDict[action]) {
    actionDict[action](id);
  }
});

renderTable();