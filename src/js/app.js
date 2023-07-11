import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
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
    .catch((err) => err.message);

  const parseData = (data) => {
    const xmlStr = data.contents;
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, 'text/xml');
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

  const setFeedPosts = (url, data) => {
    const id = uuidv4();
    const { title, description, items } = data;
    const feed = {
      id,
      url,
      title,
      description,
    };
    watchedState.feeds.unshift(feed);
    items.forEach(({ title: titlePost, link, description: descriptionPost }) => {
      const post = {
        id: uuidv4(),
        feedId: id,
        titlePost,
        link,
        descriptionPost,
      };
      watchedState.posts.unshift(post);
    });
  };
  const getData = (rss, link) => {
    axios.get(link)
      .then((response) => {
        const data = parseData(response.data);
        watchedState.loadingProcess.error = null;
        watchedState.loadingProcess.status = 'idle';
        watchedState.rssForm = {
          ...watchedState.rssForm,
          status: 'filling',
          error: null,
        };
        setFeedPosts(rss, data);
        console.log(state);
      })
      .catch((loadErr) => {
        let error = null;
        if (loadErr.isParsingError) {
          error = 'noRss';
        } else if (loadErr.isAxiosError) {
          error = 'network';
        } else {
          error = 'unknown';
        }
        watchedState.loadingProcess.error = error;
        watchedState.loadingProcess.status = 'failed';
      });
  };



  elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rss = new FormData(e.target).get('url');
    return validateRss(rss)
      .then((err) => {
        if (err) {
          watchedState.rssForm = {
            ...watchedState.rssForm,
            status: 'filling',
            valid: false,
            error: err,
          };
        } else {
          watchedState.rssForm = {
            ...watchedState.rssForm,
            status: 'filling',
            valid: true,
            error: null,
          };
          watchedState.loadingProcess.status = 'loading';
          const link = createOriginLink(rss);
          getData(rss, link);
        }
      });
  });
};
