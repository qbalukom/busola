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

import { SimpleTypeRenderer } from '../widgets-details/SimpleTypeRenderer';
import { StatusRenderer } from './StatusRenderer';

const pluginStack = [
  ReferencingHandler,
  ExtractStorePlugin,
  CombiningHandler,
  DefaultHandler,
  DependentHandler,
  ConditionalHandler,
  PluginSimpleStack,
];

export const widgets = {
  // ErrorFallback: ErrorFallback,
  RootRenderer: ({ children }) => <div>{children}</div>,
  GroupRenderer: ({ children }) => <div>{children}</div>,
  WidgetRenderer,
  pluginStack,
  types: {
    string: () => '',
    boolean: () => '',
    number: () => '',
    integer: () => '',
    array: () => '',
  },
  custom: {
    Status: StatusRenderer,
    Panel: () => '',
    /*
    Accordions: AccordionsRenderer,
    */
    // Panel: PanelRenderer,
    //    Workload: WorkloadRenderer,
    // List: GenericListRenderer,
    // Table: TableDataRenderer,
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
