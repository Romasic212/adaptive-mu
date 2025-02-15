import Fuse from 'fuse.js'

async function performSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    searchResultsContainer.innerHTML = '';
    displaySuggestions([]);

    const options = {
        keys: ['title', 'content'],  // По каким полям искать
        includeScore: true,          // Включить оценку соответствия
        threshold: 0.4               // Порог соответствия (0 - точное, 1 - очень неточное)
    };

    const fuse = new Fuse(Object.entries(pages).map(([title, url]) => ({ title, url, content: allPageContent[title] })), options);  //Создаем Fuse экземпляр.
    const results = fuse.search(searchTerm).map(result => ({
        title: result.item.title,
        url: result.item.url,
        content: result.item.content,
        score: result.score
    }));

    displayResults(results, searchTerm);
}