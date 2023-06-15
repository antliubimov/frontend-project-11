import onChange from 'on-change';

export default (elements, i18n, state) => {
  const {
    inputForm,
    feedback,
    heading,
    lead,
    urlLabel,
  } = elements;

  const init = () => {
    heading.innerText = i18n.t('components.heading');
    lead.innerText = i18n.t('components.lead');
    urlLabel.innerText = i18n.t('components.urlLabel');
  };
  const handleErrors = () => {
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.innerText = i18n.t(`errors.${state.rssForm.errors.key}`);
    inputForm.classList.remove('is-valid');
    inputForm.classList.add('is-invalid');
  };

  const handleValid = () => {
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.innerText = i18n.t('loadingSuccess');
    inputForm.classList.remove('is-invalid');
    inputForm.value = '';
    inputForm.focus();
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path === 'rssForm') {
      case (value.status === 'init'):
        init();
        break;
      case (value.valid):
        handleValid();
        break;
      default:
        handleErrors();
        break;
    }
  });

  return watchedState;
};
