import onChange from 'on-change';

export default (elements, i18n, state) => {
  const {
    inputForm,
    feedback,
    heading,
    lead,
    urlLabel,
    submit,
    feedsBox,
    postsBox,
  } = elements;

  const init = () => {
    heading.innerText = i18n.t('components.heading');
    lead.innerText = i18n.t('components.lead');
    urlLabel.innerText = i18n.t('components.urlLabel');
    inputForm.placeholder = i18n.t('components.urlLabel');
  };
  init();

  const handleValid = () => {
    submit.disabled = false;
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.innerText = i18n.t('loadingSuccess');
    inputForm.classList.remove('is-invalid');
    inputForm.removeAttribute('readonly');
    inputForm.value = '';
    inputForm.focus();
  };

  const rssFormView = (formState) => {
    const { rssForm: { valid, error } } = formState;
    if (valid) {
      inputForm.classList.remove('is-invalid');
    } else {
      inputForm.classList.add('is-invalid');
      feedback.classList.add('text-danger');
      feedback.textContent = i18n.t(`errors.${error.key}`);
    }
  };
  const loadingProcessView = (loadingState) => {
    const { loadingProcess: { status, error } } = loadingState;
    switch (status) {
      case 'failed':
        submit.disabled = false;
        inputForm.removeAttribute('readonly');
        feedback.classList.add('text-danger');
        feedback.textContent = i18n.t(`errors.${error}`);
        break;
      case 'loading':
        submit.disabled = true;
        inputForm.setAttribute('readonly', true);
        feedback.classList.remove('text-success');
        feedback.classList.remove('text-danger');
        feedback.textContent = '';
        break;
      case 'idle':
        handleValid();
        break;
      default:
        throw new Error(`Unknown loadingProcess status: '${status}'`);
    }
  };

  const createCard = () => {
    const card = document.createElement('div');
    card.classList.add('card', 'border-0');
    return card;
  };
  const createHead = (text) => {
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    const h2 = document.createElement('h2');
    h2.classList.add('card-title', 'h4');
    h2.textContent = i18n.t(text);
    cardBody.appendChild(h2);
    return cardBody;
  };

  const createFeed = (feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;
    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;
    li.appendChild(h3).appendChild(p);
    return li;
  };

  const createPost = (post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0');
    const link = document.createElement('a');
    link.href = post.link;
    link.target = '_blank';
    link.rel = 'norefferer';
    link.classList.add('fw-bold');
    link.dataset.id = post.id;
    link.textContent = post.title;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.dataset.id = post.id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = i18n.t('components.preview');
    li.appendChild(link);
    li.appendChild(button);
    return li;
  };

  const itemsView = (items, text, box, fn) => {
    const currentBox = box;
    currentBox.innerHTML = '';
    const card = createCard();
    card.appendChild(createHead(text));

    const ul = document.createElement('ul');
    ul.classList.add('list-group');
    const itemsArray = items.map((item) => fn(item));
    ul.append(...itemsArray);
    card.appendChild(ul);
    box.appendChild(card);
  };

  const feedsView = (feeds) => itemsView(feeds, 'components.feeds', feedsBox, createFeed);

  const postsView = (posts) => itemsView(posts, 'components.posts', postsBox, createPost);

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'rssForm':
        rssFormView(state);
        break;
      case 'loadingProcess.status':
        loadingProcessView(state);
        break;
      case 'feeds':
        feedsView(value);
        break;
      case 'posts':
        postsView(value);
        break;
      default:
        return watchedState;
    }
    return watchedState;
  });

  return watchedState;
};
