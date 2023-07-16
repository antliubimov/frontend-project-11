import * as yup from 'yup';
import i18next from 'i18next';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import _ from 'lodash';
import 'bootstrap';
import resources from './locales/index.js';
import watch from './view.js';

export default async () => {
  const state = {
    rssForm: {
      status: 'filling',
      valid: false,
      error: null,
    },
    feeds: [],
    posts: [],
    loadingProcess: {
      status: 'idle',
      error: null,
    },
    modal: {
      postId: null,
    },
    uiState: {
      seenPosts: new Set(),
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

  const getUrls = () => state.feeds.map((feed) => feed.url);

  const validateRss = (rss) => rssSchema.notOneOf(getUrls()).validate(rss)
    .then(() => null)
    .catch((err) => err.message);

  const parseData = (data) => {
    const { url } = data.status;
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
      url,
      title: doc.querySelector('channel > title').textContent,
      description: doc.querySelector('channel > description').textContent,
      items: [...doc.querySelectorAll('item')].map((item) => ({
        title: item.querySelector('title').textContent,
        link: item.querySelector('link').textContent,
        description: item.querySelector('description').textContent,
      })),
    };
  };

  const createPosts = (id, items) => items.map(({ title, link, description }) => ({
    id: uuidv4(),
    feedId: id,
    title,
    link,
    description,
  }));

  const createFeedAndPosts = (data) => {
    const id = uuidv4();
    const {
      url,
      title,
      description,
      items,
    } = data;
    const feed = {
      id,
      url,
      title,
      description,
    };
    const posts = createPosts(id, items);
    return { feed, posts };
  };

  const getUrlPosts = (url) => {
    const feed = state.feeds.find((item) => item.url === url);
    const { id: feedId } = feed;
    return state.posts
      .filter((post) => post.feedId === feedId)
      .map(({ title, link, description }) => ({ title, link, description }));
  };

  const comparePosts = (posts) => {
    const { url, items } = posts;
    const statePosts = getUrlPosts(url);
    let diffPosts = _.differenceWith(items, statePosts, _.isEqual);
    if (diffPosts.length) {
      diffPosts = createPosts(url, diffPosts);
    }
    return diffPosts;
  };

  const getNewPosts = (urls) => {
    const requests = urls.map((url) => {
      const link = createOriginLink(url);
      return axios.get(link);
    });
    return Promise.all(requests)
      .then((responses) => responses.map(({ data }) => parseData(data)))
      .then((parsedData) => {
        const newPosts = parsedData.reduce((acc, item) => {
          const posts = comparePosts(item);
          acc.push(...posts);
          return acc;
        }, []);
        if (newPosts.length) {
          watchedState.posts.unshift(...newPosts);
        }
      })
      .catch((e) => console.log(e))
      .finally(() => setTimeout(() => getNewPosts(getUrls()), 5000));
  };

  const getData = (rss) => {
    const link = createOriginLink(rss);
    return axios.get(link)
      .then((response) => parseData(response.data))
      .then((data) => {
        watchedState.loadingProcess.error = null;
        watchedState.loadingProcess.status = 'idle';
        watchedState.rssForm = {
          ...watchedState.rssForm,
          status: 'filling',
          error: null,
        };
        const { feed, posts } = createFeedAndPosts(data);
        watchedState.feeds.unshift(feed);
        watchedState.posts.unshift(...posts);
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
          getData(rss);
        }
      });
  });

  setTimeout(() => getNewPosts(getUrls()), 5000);

  elements.postsBox.addEventListener('click', (e) => {
    if (e.target.dataset.bsToggle === 'modal') {
      const { id } = e.target.dataset;
      watchedState.modal.postId = id;
      watchedState.uiState.seenPosts.add(id);
    }
  });
};
// https://aljazeera.com/xml/rss/all.xml
// https://buzzfeed.com/world.xml
// https://thecipherbrief.com/feed
// https://feeds.washingtonpost.com/rss/world (отвечает долго, в районе 4-5 секунд, иногда и до 10 доходит)
// https://rt.com/rss/news
// http://www.dp.ru/exportnews.xml
// http://www.fontanka.ru/fontanka.rss
// http://lenta.ru/l/r/EX/import.rss
