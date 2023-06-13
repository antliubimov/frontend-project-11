import * as yup from 'yup';
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
      error: null,
    },
  };

  const elements = {
    rssForm: document.querySelector('.rss-form'),
    inputForm: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    feedsBox: document.querySelector('.feeds'),
    postsBox: document.querySelector('.posts'),
    submit: document.querySelector('.rss-form button[type="submit"]'),
    // modal: document.querySelector('#modal'),
  };

  // Неизвестная ошибка. Что-то пошло не так.

  const watchedState = watch(elements, state);

  const rssSchema = yup.string().url('Ресурс не содержит валидный RSS');

  elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newRSS = new FormData(e.target).get('url');
    return rssSchema.notOneOf(state.rssLinks, 'RSS уже существует').validate(newRSS)
      .then((rss) => {
        state.rssLinks.push(rss);
        watchedState.rssForm = {
          ...watchedState.rssForm,
          valid: true,
          error: null,
        };
      })
      .catch((err) => {
        watchedState.rssForm = {
          ...watchedState.rssForm,
          valid: false,
          error: err.message,
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
