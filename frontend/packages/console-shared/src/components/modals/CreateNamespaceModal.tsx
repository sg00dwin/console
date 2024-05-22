import * as React from 'react';
import { Popover, Modal, ModalVariant, Button, Alert } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom-v5-compat';
import { ModalComponent } from '@console/dynamic-plugin-sdk/src/app/modal-support/ModalProvider';
import { SelectorInput, resourceObjPath, LoadingInline } from '@console/internal/components/utils';
import { NamespaceModel } from '@console/internal/models';
import { k8sCreate, referenceFor } from '@console/internal/module/k8s';
import { CreateProjectModalProps } from './CreateProjectModal';

export const CreateNamespaceModal: ModalComponent<CreateProjectModalProps> = ({
  closeModal,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [inProgress, setInProgress] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [name, setName] = React.useState('');
  const [labels, setLabels] = React.useState([]);

  const thenPromise = (res) => {
    setInProgress(false);
    setErrorMessage('');
    return res;
  };

  const catchError = (error) => {
    const err = error.message || t('console-shared~An error occurred. Please try again.');
    setInProgress(false);
    setErrorMessage(err);
    return Promise.reject(err);
  };

  const handlePromise = (promise) => {
    setInProgress(true);

    return promise.then(
      (res) => thenPromise(res),
      (error) => catchError(error),
    );
  };

  const createNamespace = () => {
    const namespace = {
      metadata: {
        name,
        labels: { ...SelectorInput.objectify(labels) },
      },
    };
    return k8sCreate(NamespaceModel, namespace);
  };

  const submit = (event) => {
    event.preventDefault();
    handlePromise(createNamespace())
      .then((obj) => {
        closeModal();
        if (onSubmit) {
          onSubmit(obj);
        } else {
          navigate(resourceObjPath(obj, referenceFor(obj)));
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`Failed to create Namespace:`, err);
      });
  };

  const popoverText = () => {
    const nameFormat = t(
      "console-shared~A Namespace name must consist of lower case alphanumeric characters or '-', and must start and end with an alphanumeric character (e.g. 'my-name' or '123-abc').",
    );
    const createNamespaceText = t(
      "console-shared~You must create a Namespace to be able to create projects that begin with 'openshift-', 'kubernetes-', or 'kube-'.",
    );
    return (
      <>
        <p>{nameFormat}</p>
        <p>{createNamespaceText}</p>
      </>
    );
  };

  return (
    <Modal
      variant={ModalVariant.small}
      title={t('console-shared~Create Namespace')}
      isOpen
      onClose={closeModal}
      actions={[
        <Button disabled={inProgress} onClick={submit}>
          {t('console-shared~Create')}
        </Button>,
        <Button disabled={inProgress} onClick={closeModal}>
          {t('console-shared~Cancel')}
        </Button>,
        ...(inProgress ? [<LoadingInline />] : []),
      ]}
    >
      <form onSubmit={submit} name="form" className="modal-content">
        <div className="form-group">
          <label htmlFor="input-name" className="control-label co-required">
            {t('console-shared~Name')}
          </label>{' '}
          <Popover aria-label={t('console-shared~Naming information')} bodyContent={popoverText}>
            <Button
              className="co-button-help-icon"
              variant="plain"
              aria-label={t('console-shared~View naming information')}
            >
              <OutlinedQuestionCircleIcon />
            </Button>
          </Popover>
          <div className="modal-body__field">
            <input
              id="input-name"
              data-test="input-name"
              name="name"
              type="text"
              className="pf-v5-c-form-control"
              onChange={(e) => setName(e.target.value)}
              value={name || ''}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="tags-input" className="control-label">
            {t('console-shared~Labels')}
          </label>
          <div className="modal-body__field">
            <SelectorInput
              labelClassName="co-m-namespace"
              onChange={(value) => setLabels(value)}
              tags={labels}
            />
          </div>
        </div>
        {errorMessage && (
          <Alert
            isInline
            className="co-alert co-alert--scrollable"
            variant="danger"
            title={t('console-shared~An error occurred')}
            data-test="alert-error"
          >
            <div className="co-pre-line">{errorMessage}</div>
          </Alert>
        )}
      </form>
    </Modal>
  );
};
