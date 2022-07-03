import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";


/*

// Отправить POST-запрос

axios({
  method: 'post',
  url: '/user/12345',
  data: {
    firstName: 'Fred',
    lastName: 'Flintstone'
  }
});

// Отправить GET-запрос (метод по умолчанию)
axios('/user/12345');


*/

const API_KEY = '28406971-da9ac527785fed0c52df2227a';
const BASE_URL = 'https://pixabay.com/api/';

const refs = {
    form: document.querySelector('#search-form'),
    searchImgTxt: document.querySelector('[name="searchQuery"]'),
    loadMoreBtn: document.querySelector('button.load-more'),
    gallery: document.querySelector('.gallery'),
};

const cardsPerPg = 40;
let pgCurrent = 1;
let searchTxt = "";
const lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt' , captionDelay: '250'});

refs.form.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMoreBtnClk);

function onFormSubmit(e) {
    e.preventDefault();

    searchTxt = e.target.elements.searchQuery.value;

    // очистка начальных значений
    resetStartedValues();

    // !!! подумать над очисткой формы !!!

    fetchImages()
        .then(drawGallery)
        .catch(console.log);
};

function resetStartedValues() {
    refs.loadMoreBtn.classList.add('is-hidden');
    refs.form.reset();
    refs.gallery.innerHTML = '';
    pgCurrent = 1;
}

function onLoadMoreBtnClk() {
    pgCurrent += 1;

    fetchImages()
        .then(drawGallery)
        .catch(console.log);
}

function fetchImages() {
    const requestOptions = new URLSearchParams({
        q: searchTxt,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: pgCurrent,
        per_page: cardsPerPg,
    });

    console.log('searchTxt: ', searchTxt);
    console.log('pgCurrent: ', pgCurrent);

    return fetch(`${BASE_URL}?key=${API_KEY}&${requestOptions}`)
        .then(resp => {
            if (!resp.ok) {
                throw Error(resp.status)
            }

            return resp.json();
        });
}

function drawGallery({ hits: cards, totalHits: totalCards }) {
    if (!totalCards) {
        Notify.failure('Sorry, there are NO IMAGES matching your search query. Please try again.');
        return;
    };

    if (pgCurrent === 1) Notify.success(`Hooray! We found ${totalCards} images.`);

    refs.gallery.insertAdjacentHTML('beforeend', createGalleryMarkup(cards));

    lightbox.refresh();

    // показать кнопку
    loadMoreBtnToggle(totalCards);
};

function loadMoreBtnToggle(totalCards) {
    if (pgCurrent === 1) refs.loadMoreBtn.classList.remove('is-hidden');

    if (pgCurrent * cardsPerPg >= totalCards) {
        refs.loadMoreBtn.classList.add('is-hidden');
        Notify.warning("We're sorry, but you've reached the END of search results.");
    }
};

function createGalleryMarkup(cards) {
    return cards.map(createCardMarkup).join('');
}

function createCardMarkup({webformatURL,largeImageURL,tags,likes,views,comments,downloads}) {
    return `
        <div class="photo-card">
            <a class="gallery-link" href="${largeImageURL}">
                <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            </a>
            <div class="info">
                <p class="info-item">
                    <b>Likes</b>${likes}
                </p>
                <p class="info-item">
                    <b>Views</b>${views}
                </p>
                <p class="info-item">
                    <b>Comments</b>${comments}
                </p>
                <p class="info-item">
                    <b>Downloads</b>${downloads}
                </p>
            </div>
        </div>
        `;
/*
    Шаблон разметки карточки одного изображения для галереи.

    <div class="photo-card">
        <img src="" alt="" loading="lazy" />
        <div class="info">
            <p class="info-item">
                <b>Likes</b>
            </p>
            <p class="info-item">
                <b>Views</b>
            </p>
            <p class="info-item">
                <b>Comments</b>
            </p>
            <p class="info-item">
                <b>Downloads</b>
            </p>
        </div>
    </div>
 */
}
