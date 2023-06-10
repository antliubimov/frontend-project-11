import * as yup from 'yup';
import watch from './view';

export default async () => {
    const state = {
        rssLink: '',
        feeds: [],
        posts: [],
    };

    let rssSchema = yup.object({
        url: yup.string().required().url(),
    });

    const rss = await rssSchema.validate();

    const rssForm = document.querySelector('.rss-form');
    const urlInput = document.querySelector('#url-input');

    rssForm.addEventListener('submit', (e) => {
        e.preventDefault();
    });

};