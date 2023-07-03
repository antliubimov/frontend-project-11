import onChange from 'on-change';

export default (elements, i18n, state) => {
  const {
    inputForm,
    feedback,
    heading,
    lead,
    urlLabel,
    submit,
  } = elements;

  const init = () => {
    heading.innerText = i18n.t('components.heading');
    lead.innerText = i18n.t('components.lead');
    urlLabel.innerText = i18n.t('components.urlLabel');
  };
  init();
  const handleErrors = () => {
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.innerText = i18n.t(`errors.${state.rssForm.error ? state.rssForm.error.key : state.loadingProcess.error}`);
    inputForm.classList.remove('is-valid');
    inputForm.classList.add('is-invalid');
  };

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

  const watchedState = onChange(state, (path) => {
    console.log(watchedState);
    switch (path) {
      case 'rssForm':
        ((value) => {
          const { rssForm: { valid, error } } = value;
          if (valid) {
            inputForm.classList.remove('is-invalid');
          } else {
            inputForm.classList.add('is-invalid');
            feedback.classList.add('text-danger');
            feedback.textContent = i18n.t(`errors.${error.key}`);
          }
        })(state);
        break;
      case 'loadingProcess':
        ((value) => {
          const { loadingProcess: { status, error } } = value;
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
        })(state);
        break;
    }
  });

  return watchedState;
};
