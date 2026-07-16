export type {
  ProductIngredientInput,
  StackIntakeItem,
  StackIntakeInput,
  IngredientContributor,
  IngredientUnitTotal,
  IngredientIntake,
  StackIntake,
} from './intake';

export {
  normalizeUnit,
  normalizeIngredientName,
  computeStackIntake,
  summarizeAddition,
  EMPTY_STACK_INTAKE,
} from './intake';
