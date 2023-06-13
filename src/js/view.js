import onChange from 'on-change';

export default (elements, state) => {
  const { inputForm, feedback } = elements;

  const handleErrors = () => {
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.innerText = state.rssForm.error;
    inputForm.classList.remove('is-valid');
    inputForm.classList.add('is-invalid');
  };

  const handleValid = () => {
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.innerText = 'RSS успешно загружен';
    inputForm.classList.remove('is-invalid');
    inputForm.value = '';
    inputForm.focus();
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'rssForm') {
      if (value.valid) {
        handleValid();
      } else {
        handleErrors();
      }
    }
  });

  return watchedState;
};
