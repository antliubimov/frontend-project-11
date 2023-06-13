import * as yup from 'yup';
import watch from './view.js';

export default async () => {
  //   , t = {
  //
  //   modal: {
  //     postId: null
  //   },
  //   ui: {
  //     seenPosts: new Set
  //   }
  // }
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
    input: document.querySelector('.rss-form input'),
    feedback: document.querySelector('.feedback'),
    feedsBox: document.querySelector('.feeds'),
    postsBox: document.querySelector('.posts'),
    submit: document.querySelector('.rss-form button[type="submit"]'),
    modal: document.querySelector('#modal'),
  };

  // Неизвестная ошибка. Что-то пошло не так.

  const { rssForm, rssLinks } = watch(elements, state);

  const rssSchema = yup.string().url('Ресурс не содержит валидный RSS'); // .notOneOf(watchedState.rssLinks, 'RSS уже существует');

  elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newRSS = new FormData(e.target).get('url');
    return rssSchema.notOneOf(rssLinks, 'RSS уже существует').validate(newRSS)
      .then((rss) => {
        rssForm.valid = true;
        rssLinks.push(rss);
        rssForm.error = null;
      })
      .catch((err) => {
        rssForm.valid = false;
        rssForm.error = err.message;
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
