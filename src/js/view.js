import onChange from 'on-change';

export default (elements, state) => {
  // const { form, feedback, feeds, posts } = elements;
  const { feedback } = elements;

  const urlInput = document.querySelector('#url-input');
  const handleErrors = () => {
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.innerText = [state.rssForm.error];
    urlInput.classList.remove('is-valid');
    urlInput.classList.add('is-invalid');
  };

  const handleValid = () => {
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.innerText = 'RSS успешно загружен';
    urlInput.classList.remove('is-invalid');
    urlInput.value = '';
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'rssForm.error') {
      if (!value) {
        handleValid();
      } else {
        handleErrors();
      }
    }
  });

  return watchedState;
};
