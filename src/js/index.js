import '../scss/styles.scss';
import * as bootstrap from 'bootstrap';
import onChange from 'on-change';
import yup from 'yup';

const state = {
  rssLink: '',
  feeds: [],
  posts: [],
};

const rssForm = document.querySelector('.rss-form');
const urlInput = document.querySelector('#url-input');