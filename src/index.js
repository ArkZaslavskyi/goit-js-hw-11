import { Notify } from 'notiflix/build/notiflix-notify-aio';
const notifyOptions = {
    timeout: 5000,
}

import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
const lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt', captionDelay: '250' });

const fetchOptions = {
    searsearchTxt: "",
    pgCurrent: 1,
    cardsPerPg: 40,
};

import { fetchImages } from './js/fetchImages';
import { drawGalleryToDOM } from './js/drawGalleryToDOM';

const refs = {
    form: document.querySelector('#search-form'),
    searchImgTxt: document.querySelector('[name="searchQuery"]'),
    loadMoreBtn: document.querySelector('.load-more-btn'),
    gallery: document.querySelector('.gallery'),
};

let totalCards = 0;

const observerOptions = {
    rootMargin: '350px',
    threshold: 1.0
};
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // console.log('!!! INTERSECTING !!!');
            
            if (fetchOptions.pgCurrent * fetchOptions.cardsPerPg >= totalCards) {
                Notify.warning("We're sorry, but you've reached the END of search results.", notifyOptions);
                return;
            }

            onLoadMoreImages();
        };
    });
}, observerOptions);

refs.form.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMoreImages);

async function onFormSubmit(e) {
    try {
        e.preventDefault();

        fetchOptions.searchTxt = e.target.elements.searchQuery.value;
        if (!fetchOptions.searchTxt) {
            Notify.failure('Sorry, there are EMPTY your search query. Please try again.', notifyOptions);
            return;
        }

        // очистка начальных значений
        resetStartedValues();

        const fetchData = await fetchImages(fetchOptions);
        await drawGallery(fetchData);
    } catch (err) {
        Notify.failure(err, notifyOptions);
    }
};

function resetStartedValues() {
    refs.gallery.innerHTML = '';
    fetchOptions.pgCurrent = 1;
    setObserveOff();
}

async function onLoadMoreImages() {
    try {
        fetchOptions.pgCurrent += 1;

        const fetchData = await fetchImages(fetchOptions);
        await drawGallery(fetchData);
    } catch (err) {
        Notify.failure(err, notifyOptions);
    };
}

function setObserveOn() {
    // document.querySelector('#scroll-check').classList.add('scroll-check');
    observer.observe(document.querySelector('.scroll-check'));
};

function setObserveOff() {
    observer.unobserve(document.querySelector('.scroll-check'));
    // document.querySelector('#scroll-check').classList.remove('scroll-check');
};

function drawGallery(data) {
    const cards = data.hits;
    totalCards = data.totalHits;

    if (!totalCards) {
        Notify.failure('Sorry, there are NO IMAGES matching your search query. Please try again.', notifyOptions);
        
        refs.form.reset();
        return;
    };

    if (fetchOptions.pgCurrent === 1) {
        Notify.success(`Hooray! We found ${totalCards} images.`, notifyOptions);
    };

    drawGalleryToDOM(refs.gallery, cards);

    lightbox.refresh();

    setObserveOn();
};
