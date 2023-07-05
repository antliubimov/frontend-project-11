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

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'rssForm':
        rssFormView(state);
        break;
      case 'loadingProcess.status':
        loadingProcessView(state);
        break;
      default:
        return watchedState;
    }
    return watchedState;
  });

  return watchedState;
};
