import React, { useRef, useEffect } from 'react';
import classnames from 'classnames';

import { ModeSelector } from './ModeSelector';
import { Editor } from '../fields/Editor';
import { Presets } from './Presets';
import { useCreateResource } from '../useCreateResource';

import { ResourceFormWrapper } from './Wrapper';

import './ResourceForm.scss';

export function ResourceForm({
  pluralKind, // used for the request path
  singularName,
  resource,
  initialResource,
  setResource,
  setCustomValid,
  onChange,
  formElementRef,
  children,
  renderEditor,
  createUrl,
  presets,
  onPresetSelected,
  afterCreatedFn,
  className,
  yamlOnly = false,
  startingMode = ModeSelector.MODE_SIMPLE,
}) {
  const createResource = useCreateResource(
    singularName,
    pluralKind,
    resource,
    initialResource,
    createUrl,
    afterCreatedFn,
  );

  const [mode, setMode] = React.useState(
    yamlOnly ? ModeSelector.MODE_YAML : startingMode,
  );

  const validationRef = useRef(true);

  useEffect(() => {
    if (setCustomValid) {
      setCustomValid(validationRef.current);
    }
    validationRef.current = true;
  }, [resource, children, setCustomValid]);

  const presetsSelector = presets?.length && (
    <Presets
      presets={presets}
      onSelect={({ value }) => {
        if (onPresetSelected) {
          onPresetSelected(value);
        } else {
          setResource(value);
        }

        if (onChange) {
          onChange(new Event('input', { bubbles: true }));
        }
      }}
    />
  );

  let editor = <Editor value={resource} setValue={setResource} />;
  editor = renderEditor
    ? renderEditor({ defaultEditor: editor, Editor })
    : editor;

  return (
    <section className={classnames('resource-form', className)}>
      {presetsSelector}
      {!yamlOnly && <ModeSelector mode={mode} setMode={setMode} />}
      <form ref={formElementRef} onSubmit={createResource}>
        {mode === ModeSelector.MODE_SIMPLE && (
          <div onChange={onChange} className="simple-form">
            <ResourceFormWrapper
              resource={resource}
              setResource={setResource}
              isAdvanced={false}
            >
              {children}
            </ResourceFormWrapper>
          </div>
        )}
        {mode === ModeSelector.MODE_YAML && editor}
        {/* always keep the advanced form to ensure validation */}
        <div
          className="advanced-form"
          onChange={onChange}
          hidden={mode !== ModeSelector.MODE_ADVANCED}
        >
          <ResourceFormWrapper
            resource={resource}
            setResource={setResource}
            isAdvanced={true}
            validationRef={validationRef}
          >
            {children}
          </ResourceFormWrapper>
        </div>
      </form>
    </section>
  );
}
