const SearchService =
require("../app/search/SearchService");

const busca =
new SearchService();

const resultados =
busca.buscar("Conselho de Classe");

console.log(resultados);