// Timing thresholds for UI micro-loaders and network timeouts

// Brief minimum duration (600ms) prevents UI flash and ensures smooth motion.
export const MIN_BREAKDOWN_LOADER_MS = 600;

// Maximum wait time before timing out request.
export const MAX_BREAKDOWN_WAIT_MS = 15000;

// Minimum loader duration for step shrinking to keep tactile smoothness.
export const SHRINK_STEP_LOADER_MS = 400;
