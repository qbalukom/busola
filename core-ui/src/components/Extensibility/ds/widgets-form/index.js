import { WidgetRenderer } from '@ui-schema/ui-schema/WidgetRenderer';

import {
  DefaultHandler,
  DependentHandler,
  ConditionalHandler,
  CombiningHandler,
  ReferencingHandler,
  ExtractStorePlugin,
} from '@ui-schema/ui-schema/Plugins';
import { PluginSimpleStack } from '@ui-schema/ui-schema/PluginSimpleStack';
import { ValidityReporter } from '@ui-schema/ui-schema/ValidityReporter';
import { validators } from '@ui-schema/ui-schema/Validators/validators';

import { StringRenderer } from './StringRenderer';

const pluginStack = [
  ReferencingHandler,
  ExtractStorePlugin,
  CombiningHandler,
  DefaultHandler,
  DependentHandler,
  ConditionalHandler,
  PluginSimpleStack,
  ValidityReporter,
];

export const widgets = {
  // ErrorFallback: ErrorFallback,
  RootRenderer: ({ children }) => <div>{children}</div>,
  GroupRenderer: ({ children }) => <div>{children}</div>,
  WidgetRenderer,
  pluginStack,
  pluginSimpleStack: validators,
  types: {
    string: StringRenderer,
    boolean: ({ children }) => <span>TODO: boolean</span>,
    number: StringRenderer,
    integer: StringRenderer,
    array: ({ children }) => <>TODO: array</>,
  },
  custom: {
    /*
    Accordions: AccordionsRenderer,
    */
    Text: StringRenderer,
    /*
    Text: TextRenderer,
    StringIcon: StringIconRenderer,
    TextIcon: TextIconRenderer,
    NumberIcon: NumberIconRenderer,
    NumberSlider,
    SimpleList,
    GenericList,
    OptionsCheck,
    OptionsRadio,
    Select,
    SelectMulti,
    Card: CardRenderer,
    LabelBox,
    FormGroup,
    */
  },
};
export default widgets;
