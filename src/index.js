import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import axios from 'axios';

const API_KEY = '28406971-da9ac527785fed0c52df2227a';
const BASE_URL = 'https://pixabay.com/api/';
axios.defaults.baseURL = BASE_URL;

const refs = {
    form: document.querySelector('#search-form'),
    searchImgTxt: document.querySelector('[name="searchQuery"]'),
    loadMoreBtn: document.querySelector('.load-more-btn'),
    gallery: document.querySelector('.gallery'),
};

const cardsPerPg = 40;
let pgCurrent = 1;
let totalCards = 0;
let searchTxt = "";

const notifyOptions = {
    timeout: 5000,
}
const lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt', captionDelay: '250' });

const observerOptions = {
    // root: document.querySelector('#scrollArea'),
    rootMargin: '350px',
    threshold: 1.0
};

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            console.log('!!! INTERSECTING !!!');
            
            if (pgCurrent * cardsPerPg >= totalCards) {
                Notify.warning("We're sorry, but you've reached the END of search results.", notifyOptions);
                return;
            }

            // 1. HTTP-запрос
            // 2. Добавить разметку
            onLoadMoreImages();

        };
    });
}, observerOptions);

refs.form.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMoreImages);

// axiosImages();

async function onFormSubmit(e) {
    try {
        e.preventDefault();

        searchTxt = e.target.elements.searchQuery.value;

        // очистка начальных значений
        resetStartedValues();

        // !!! подумать над очисткой формы !!!

        const fetchData = await fetchImages();
        await drawGallery(fetchData);
    } catch (err) {
        console.error(err);
    }
};

function setObserveOn() {
    // document.querySelector('#scroll-check').classList.add('scroll-check');
    observer.observe(document.querySelector('.scroll-check'));
};

function setObserveOff() {
    observer.unobserve(document.querySelector('.scroll-check'));
    // document.querySelector('#scroll-check').classList.remove('scroll-check');
};

function resetStartedValues() {
    refs.loadMoreBtn.classList.add('is-hidden');
    refs.gallery.innerHTML = '';
    pgCurrent = 1;
    setObserveOff();
}

async function onLoadMoreImages() {
    try {
        pgCurrent += 1;

        const fetchData = await fetchImages();
        await drawGallery(fetchData);

        // observer.observe(document.querySelector('.scroll-check'));
    } catch (err) {
        console.error(err);
    };
}

async function fetchImages() {
    try {
        console.log('searchTxt: ', searchTxt);
        console.log('pgCurrent: ', pgCurrent);

        const config = {
            params: {
                key: API_KEY,
                q: searchTxt,
                image_type: 'photo',
                orientation: 'horizontal',
                safesearch: true,
                page: pgCurrent,
                per_page: cardsPerPg,
            },
        };

        const resp = await axios.get('', config);
        console.log('resp: ', resp);
        return resp.data;
    } catch (err) {
        Notify.failure(err);
    };
}

function drawGallery(data) {
    // { hits: cards, totalHits: totalCards }
    const cards = data.hits;
    totalCards = data.totalHits;

    if (!totalCards) {
        Notify.failure('Sorry, there are NO IMAGES matching your search query. Please try again.', notifyOptions);
        
        refs.form.reset();
        return;
    };

    if (pgCurrent === 1) Notify.success(`Hooray! We found ${totalCards} images.`, notifyOptions);

    refs.gallery.insertAdjacentHTML('beforeend', createGalleryMarkup(cards));

    lightbox.refresh();

    setObserveOn();

    // показать кнопку
    // loadMoreBtnToggle(totalCards);

    // observer.observe(document.querySelector('.scroll-check'));
};

function loadMoreBtnToggle(totalCards) {
    if (pgCurrent === 1) refs.loadMoreBtn.classList.remove('is-hidden');

    if (pgCurrent * cardsPerPg >= totalCards) {
        refs.loadMoreBtn.classList.add('is-hidden');
        Notify.warning("We're sorry, but you've reached the END of search results.", notifyOptions);
    }
};

function createGalleryMarkup(cards) {
    return cards.map(createCardMarkup).join('');
}

function createCardMarkup({webformatURL,largeImageURL,tags,likes,views,comments,downloads}) {
    return `
        <div class="photo-card">
            <a class="gallery-link" href="${largeImageURL}">
                <img class="gallery-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
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
}
