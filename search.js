const pages = {
    'матан': 'matan.html',
    'история': 'history.html',
    'русский язык': 'russian.html',
    'физика': 'physics.html',
    'инфа': 'info.html',
    'обж': 'obzh.html'
};

const searchInput = document.getElementById('search-input');
const searchResultsContainer = document.getElementById('search-results');

let allPageContent = {}; // Объект для хранения содержимого всех страниц
let currentPage = 1;       // Текущая страница результатов
const resultsPerPage = 3;   // Количество результатов на странице

// --- Автоматические подсказки ---
function getSuggestions(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    return Object.keys(pages).filter(pageName =>
        pageName.toLowerCase().startsWith(searchTerm) && searchTerm.length > 0
    );
}

function displaySuggestions(suggestions) {
    searchResultsContainer.innerHTML = '';
    if (suggestions.length > 0) {
        const ul = document.createElement('ul');
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = pages[suggestion];
            a.textContent = suggestion;
            li.appendChild(a);
            ul.appendChild(li);
        });
        searchResultsContainer.appendChild(ul);
    } else if (searchInput.value.trim() !== "") {
        searchResultsContainer.textContent = 'Ничего не найдено.';
    } else {
        searchResultsContainer.textContent = '';
    }
}

searchInput.addEventListener('input', function() {
    const searchTerm = this.value;
    const suggestions = getSuggestions(searchTerm);
    displaySuggestions(suggestions);
    currentPage = 1; // Сбрасываем страницу при новом вводе
});

// --- Живой поиск (с задержкой) ---
let searchTimeout;

searchInput.addEventListener('keyup', function(event) { // Используем keyup вместо input
    clearTimeout(searchTimeout); // Отменяем предыдущий таймер
    searchTimeout = setTimeout(() => {  // Устанавливаем новый таймер
        currentPage = 1; // Сбрасываем страницу перед поиском
        performSearch(); // Вызываем функцию поиска
    }, 200); // Задержка в 200 мс
});

// --- Загрузка контента всех страниц при загрузке страницы ---
async function loadAllPageContent() {
    for (const pageName in pages) {
        try {
            const response = await fetch(pages[pageName]);
            const content = await response.text();
            allPageContent[pageName] = content; // Сохраняем содержимое в объект
        } catch (error) {
            console.error(`Ошибка загрузки страницы ${pages[pageName]}:`, error);
        }
    }
}

// --- Функция выполнения поиска (теперь отдельно) ---
async function performSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  searchResultsContainer.innerHTML = '';
  displaySuggestions([]);  // Скрываем подсказки

  const results = [];

  for (const pageName in pages) {
    if (allPageContent[pageName]) { // Используем предварительно загруженный контент
      if (pageName.toLowerCase().includes(searchTerm) || allPageContent[pageName].toLowerCase().includes(searchTerm)) {
        results.push({ title: pageName, url: pages[pageName], content: allPageContent[pageName] });
      }
    }
  }
   displayResults(results, searchTerm);
}

// --- Пагинация и Выделение результатов поиска ---
function displayResults(results, searchTerm) {
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const paginatedResults = results.slice(startIndex, endIndex);

    searchResultsContainer.innerHTML = ''; // Очищаем перед отображением результатов

    if (paginatedResults.length > 0) {
        paginatedResults.forEach(result => {
             const highlightedContent = highlightSearchTerm(result.content, searchTerm);  // Выделение
            const resultLink = document.createElement('a');
            resultLink.href = result.url;
            resultLink.innerHTML = `<b>${result.title}</b><br>${highlightedContent.substring(0, 200)}...`; //Обрезаем текст для предпросмотра
            searchResultsContainer.appendChild(resultLink);
            searchResultsContainer.appendChild(document.createElement('br'));
        });

        displayPagination(results.length);  //Отображаем пагинацию
    } else {
        searchResultsContainer.textContent = 'Ничего не найдено.';
    }
}

//Функция выделения найденного текста
function highlightSearchTerm(text, searchTerm) {
    const regex = new RegExp(searchTerm, 'gi'); // 'gi' для глобального и регистронезависимого поиска
    return text.replace(regex, match => `<mark>${match}</mark>`);
}

//Функция отображения пагинации
function displayPagination(totalResults) {
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination'); //Для стилизации

    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.addEventListener('click', function(event) {
            event.preventDefault();
            currentPage = i;
            performSearch(); // Вызываем поиск с новой страницей
        });

        if (i === currentPage) {
            pageLink.classList.add('active');  //Подсветка текущей страницы
        }

        paginationContainer.appendChild(pageLink);
    }

    searchResultsContainer.appendChild(paginationContainer); //Добавляем пагинацию в контейнер результатов
}

// --- Запуск всего при загрузке страницы ---
document.addEventListener('DOMContentLoaded', async function() {
    await loadAllPageContent(); // Загружаем контент всех страниц
});