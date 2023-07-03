import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import resources from './locales/index.js';
import watch from './view.js';

export default async () => {
  const state = {
    rssForm: {
      status: 'filling',
      valid: false,
      error: null,
    },
    rssLinks: [],
    feeds: [],
    posts: [],
    loadingProcess: {
      status: 'idle',
      error: null,
    },
  };

  const defaultLanguage = 'ru';

  const i18nextInstance = i18next.createInstance();
  await i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  yup.setLocale({
    string: {
      url: () => ({
        key: 'notUrl',
      }),
    },
    mixed: {
      required: () => ({
        key: 'required',
      }),
      notOneOf: () => ({
        key: 'exists',
      }),
    },
  });

  const rssSchema = yup.string().required().url();

  const elements = {
    rssForm: document.querySelector('.rss-form'),
    inputForm: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    feedsBox: document.querySelector('.feeds'),
    postsBox: document.querySelector('.posts'),
    submit: document.querySelector('.rss-form button[type="submit"]'),
    modal: document.querySelector('#modal'),
    heading: document.querySelector('h1'),
    lead: document.querySelector('.lead'),
    urlLabel: document.querySelector('label[for="url-input"]'),
  };

  const watchedState = watch(elements, i18nextInstance, state);

  const createOriginLink = (rss) => {
    const url = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
    return `${url}${encodeURIComponent(rss)}`;
  };

  const validateRss = (rss) => rssSchema.notOneOf(state.rssLinks).validate(rss)
    .then(() => null)
    .catch((err) => {
      watchedState.rssForm = {
        ...watchedState.rssForm,
        status: 'filling',
        valid: false,
        error: err.message,
      };
    });

  const parseData = (data) => {
    const xmlStr = data.contents;
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, 'text/xml');
    console.log(doc)
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
      const err = new Error(errorNode.textContent);
      err.isParsingError = true;
      throw err;
    }
    return {
      title: doc.querySelector('channel > title').textContent,
      description: doc.querySelector('channel > description').textContent,
      items: [...doc.querySelectorAll('item')].map((item) => ({
        title: item.querySelector('title').textContent,
        link: item.querySelector('link').textContent,
        description: item.querySelector('description').textContent,
      })),
    };
  };

  elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newRss = new FormData(e.target).get('url');
    validateRss(newRss)
      .then((rss) => {
        watchedState.loadingProcess = {
          ...watchedState.loadingProcess,
          status: 'loading',
        };
        axios.get(createOriginLink(rss))
          .then((response) => {
            const data = parseData(response.data);
            watchedState.loadingProcess = {
              ...watchedState.loadingProcess,
              status: 'idle',
              error: null,
            };
            watchedState.rssForm = {
              ...watchedState.rssForm,
              status: 'filling',
              error: null,
            };
          })
          .catch((err) => {
            let error = null;
            if (err.isParsingError) {
              error = 'noRss';
            } else if (err.isAxiosError) {
              error = 'network';
            } else {
              error = 'unknown';
            }
            watchedState.loadingProcess = { error, status: 'failed' };
          });
      });
  });
};
