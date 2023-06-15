import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index.js';
import watch from './view.js';

export default async () => {
  //   modal: {
  //     postId: null
  //   },
  //   ui: {
  //     seenPosts: new Set

  const state = {
    rssForm: {
      status: 'filling',
      valid: false,
      error: null,
    },
    rssLink: '',
    rssLinks: [],
    feeds: [],
    posts: [],
    loadingProcess: {
      status: 'idle',
      errors: null,
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

  watchedState.rssForm = {
    ...watchedState.rssForm,
    status: 'init',
  };

  elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newRSS = new FormData(e.target).get('url');
    return rssSchema.notOneOf(state.rssLinks).validate(newRSS)
      .then((rss) => {
        state.rssLinks.push(rss);
        watchedState.rssForm = {
          ...watchedState.rssForm,
          status: 'filling',
          valid: true,
          errors: null,
        };
      })
      .catch((err) => {
        watchedState.rssForm = {
          ...watchedState.rssForm,
          status: 'filling',
          valid: false,
          errors: err.message,
        };
      });

    // (t, watchedState.feeds).then((e=>{
    //     e ? watchedState.form = {
    //       ...watchedState.form,
    //       valid: false,
    //       error: e.key
    //     } : (watchedState.form = {
    //       ...watchedState.form,
    //       valid: true,
    //       error: null
    //     },
    //       ((e,t)=>{
    //           e.loadingProcess.status = "loading";
    //           const n = jo(t);
    //           Ci.get(n, {
    //             timeout: 1e4
    //           }).then((n=>{
    //               const r = Hs(n.data.contents)
    //                 , i = {
    //                 url: t,
    //                 id: Ai(),
    //                 title: r.title,
    //                 description: r.descrpition
    //               }
    //                 , s = r.items.map((e=>({
    //                 ...e,
    //                 channelId: i.id,
    //                 id: Ai()
    //               })));
    //               e.posts.unshift(...s),
    //                 e.feeds.unshift(i),
    //                 e.loadingProcess.error = null,
    //                 e.loadingProcess.status = "idle",
    //                 e.form = {
    //                   ...e.form,
    //                   status: "filling",
    //                   error: null
    //                 }
    //             }
    //           )).catch((t=>{
    //               console.log(t),
    //  e.loadingProcess.error =
    // (e=>e.isParsingError ? "noRss" : e.isAxiosError ? "network" : "unknown")(t),
    //                 e.loadingProcess.status = "failed"
    //             }
    //           ))
    //         }
    //       )(s, t))
    //   }
    // ))
  });
};
