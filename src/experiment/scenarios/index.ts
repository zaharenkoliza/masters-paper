export { scenario1 } from './scenario1'
export { scenario2 } from './scenario2'
export { scenario3 } from './scenario3'
export type { Scenario, Task } from './types'

import { scenario1 } from './scenario1'
import { scenario2 } from './scenario2'
import { scenario3 } from './scenario3'
import type { Scenario } from './types'

export const SCENARIOS: Record<1 | 2 | 3, Scenario> = {
  1: scenario1,
  2: scenario2,
  3: scenario3,
}
