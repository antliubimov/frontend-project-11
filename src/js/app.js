import * as yup from 'yup';
import watch from './view.js';

export default async () => {
  const state = {
    rssLink: '',
    feeds: [],
    posts: [],
  };

  const elements = {
    rssForm: document.querySelector('.rss-form'),
    fields: {},
    errorFields: {},
  };

  // Неизвестная ошибка. Что-то пошло не так.
  // Ресурс не содержит валидный RSS
  // RSS успешно загружен

  const rssSchema = yup.object({
    url: yup.string().required().url(),
  });

  const watchedState = watch(elements, state);

  elements.rssForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newRSS = Object.fromEntries(formData);
    try {
      await rssSchema.validate(newRSS);
      watchedState.rssForm.valid = true;
      watchedState.rssForm.errors = [];
    } catch (err) {
      const errors = err.inner.reduce((acc, currErr) => {
        const { path, message } = currErr;
        return { ...acc, [path]: [...(acc[path] || []), message] };
      }, {});
      watchedState.rssForm.errors = errors;
    }
  });
};
