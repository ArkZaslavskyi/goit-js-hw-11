import { createCardMarkup } from './createCardMarkup';

export function createGalleryMarkup(cards) {
    return cards.map(createCardMarkup).join('');
}