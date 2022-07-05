import { createGalleryMarkup } from "./createGalleryMarkup";

export function drawGalleryToDOM(gallery, cards) {
    gallery.insertAdjacentHTML('beforeend', createGalleryMarkup(cards));
}
