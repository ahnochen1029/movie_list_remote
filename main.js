const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const dataPanel = document.querySelector('#data-panel')

const movies = []
let filteredMovies = []

const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

const paginator = document.querySelector('#paginator')

const changeMode = document.querySelector('#change-mode')
let nowPage = 1
let mode = 'card'

function displayData() {
  const movieList = getMoviesByPage(nowPage)
  mode === 'card' ? renderMovieByCard(movieList) : renderMovieByList(movieList)
}

changeMode.addEventListener('click', function onChangeModeClicked(event) {
  if (event.target.matches('#cardMode')) {
    mode = 'card'
  } else if (event.target.matches('#listMode')) {
    mode = 'list'
  }
  displayData()
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  // if (!keyword.length) {
  //   return alert('error')
  // }
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert(`Can not find ${keyword} in the movie list`)
  }
  renderPaginator(filteredMovies.length)
  nowPage = 1
  displayData()
})


function renderMovieByCard(data) {
  let rawHTML = ''
  // title, image
  data.forEach((item) => {
    rawHTML += `<div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img
            src="${POSTER_URL + item.image}"
            class="card-img-top" alt="...">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function renderMovieByList(data) {
  let rawHTML = ''
  rawHTML += '<table class="table"><tbody>'
  data.forEach((item) => {
    rawHTML += `    
          <tr>
	          <td>
	           <h5 class="card-title">${item.title}</h5>
	          </td>
	        <td>
 	          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
   	      </td>
	        </tr>`
  })
  rawHTML += '</tbody></table>'
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const NumberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= NumberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = "${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  nowPage = Number(event.target.dataset.page)
  displayData()
})

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-modal-image")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector("#movie-modal-description")
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date :' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img
              src="${POSTER_URL + data.image}"
              alt="movie-poster" class="img-fluid">`
    })
    .catch((err) => console.log(error))
}

function addToFavorite(id) {
  function isMovieIdMatched(movie) {
    return movie.id === id
  }
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(isMovieIdMatched)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經收藏在清單中')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
  console.log(list)
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    displayData()
  })
  .catch((error) => console.log(error)
  )