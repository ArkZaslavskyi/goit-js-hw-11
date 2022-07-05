import axios from 'axios';
axios.defaults.baseURL = 'https://pixabay.com/api/';

const API_KEY = '28406971-da9ac527785fed0c52df2227a';

export async function fetchImages(
    { searchTxt, pgCurrent, cardsPerPg}) { 
    
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
        return resp.data;
    } catch (err) {
        console.error(err);
        Notify.failure(err);
    };
}

