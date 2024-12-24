const config = {
  TMDB_API_ACCESS_TOKEN: "",
};

let API_ACCESS_TOKEN = config.TMDB_API_ACCESS_TOKEN;
let url = new URL(
  `https://api.themoviedb.org/3/movie/now_playing?region=KR&language=ko-KR`
);
let tmdbImageBaseUrl = "https://image.tmdb.org/t/p/w500";
let checkMenus = document.querySelector(".menus");
let checkGenres = document.getElementById("genre_menus");

// Search functionality
const searchIcon = document.querySelector(".searchIcon");
const search2Icon = document.querySelector(".search2Icon");
const searchInput = document.querySelector(".searchInput");
const grade = document.querySelector(".grade");

searchIcon.addEventListener("click", () => {
  searchIcon.classList.add("active");
  searchInput.classList.add("active");
  search2Icon.classList.add("active");
});

window.enterkeySearch = () => {
  if (window.event.keyCode == 13) {
    getMoviesByKeyword();
  }
};

const getMoviesByKeyword = async () => {
  const keyword = searchInput.value;
  console.log("keyword", keyword);
  url = new URL(
    `https://api.themoviedb.org/3/search/movie?query=${keyword}&language=ko-KR`
  );
  getMovieData();
};

// Category selection
const menus = document.querySelectorAll(".menus button");
menus.forEach((menu) =>
  menu.addEventListener("click", (event) => getMoviesCategory(event))
);

const getMoviesCategory = async (event) => {
  const category = event.target.id;
  console.log("category", category);
  let url;
  if (
    category === "popular" ||
    category === "top_rated" ||
    category === "now_playing"
  ) {
    url = new URL(`https://api.themoviedb.org/3/movie/${category}`);
    url.searchParams.append("language", "ko-KR");
  } else {
    console.error("Invalid category");
    return;
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    movieList = data.results;
    render();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};

// Pagination and data variables
const pageSize = 20;
const groupSize = 10;
let page = 1;
let totalResult = 0;
let totalPage = 0;
let movieList = [];
let genresList = [];
let likeLMovieList = [];
let genreObject = {};
let selectedGenresList = [];

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_ACCESS_TOKEN}`,
  },
};

// Genre filtering
const genreMenus = document.querySelectorAll("#genre_menus button");
genreMenus.forEach((genre) =>
  genre.addEventListener("click", (event) => genreFilterRender(event))
);

const getGenresList = async () => {
  url = new URL(
    "https://api.themoviedb.org/3/genre/movie/list?&language=ko-KR"
  );
  const response = await fetch(url, options);
  const data = await response.json();
  genresList = data.genres;
};

const genreFilterRender = (event) => {
  page = 1;
  const genreName = event.target.textContent;
  let genreId = 0;

  for (let i = 0; i < genresList.length; i++) {
    if (genresList[i].name === genreName) {
      genreId = genresList[i].id;
      break;
    }
  }

  if (selectedGenresList.includes(genreId)) {
    selectedGenresList = selectedGenresList.filter((id) => id !== genreId);
  } else {
    selectedGenresList.push(genreId);
  }

  highlightSelectedGenreButtons();

  url = new URL(
    `https://api.themoviedb.org/3/discover/movie?with_genres=${selectedGenresList.join(
      ","
    )}&language=ko-KR`
  );
  getMovieData();
};

function highlightSelectedGenreButtons() {
  genreMenus.forEach((genre) => {
    genre.classList.remove("highlight");
  });

  if (selectedGenresList.length !== 0) {
    selectedGenresList.forEach((id) => {
      const genreButton = Array.from(genreMenus).find(
        (button) => button.dataset.id == id
      );
      if (genreButton) {
        genreButton.classList.add("highlight");
      }
    });
  }
}

// Reset genres
function resetBtn() {
  const resetButton = document.getElementById("clear");
  if (selectedGenresList.length === 0) {
    resetButton.style.display = "none";
  } else {
    resetButton.classList.add("highlight");
    resetButton.addEventListener("click", () => {
      selectedGenresList = [];
      genreMenus.forEach((genre) => {
        genre.classList.remove("highlight");
      });
    });
  }
}

// Render movies
const render = () => {
  searchInput.value = "";
  let movieHtml = "";

  for (let movie of movieList) {
    let genres = movie.genre_ids
      .map((id) => genresList.find((genre) => genre.id === id)?.name || "")
      .join(", ");
    movieHtml += `
      <div class="movieCard">
        <img src="${
          movie.poster_path
            ? tmdbImageBaseUrl + movie.poster_path
            : "https://www.freeiconspng.com/thumbs/no-image-icon/no-image-icon-10.png"
        }" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>${genres}</p>
      </div>`;
  }

  document.getElementById("movie-board-input").innerHTML = movieHtml;
};

// Error handling
const errorRender = (errorMessage) => {
  const errorHTML = `<div class="alert">${errorMessage}</div>`;
  document.getElementById("movie-board-input").innerHTML = errorHTML;
};

// Main execution
const main = async () => {
  page = 1;
  getGenresList();
  url = new URL(
    `https://api.themoviedb.org/3/movie/now_playing?language=ko-KR&region=KR`
  );
  getMovieData();
};

main();
