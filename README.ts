Here's a one-liner for the PR:

Register tsconfig-paths in the ts-node run so the @framework/* path aliases resolve outside Jest (ts-node doesn't read tsconfig paths on its own), fixing the MODULE_NOT_FOUND when running run-test-suite.ts.

If you want it even tighter for a commit subject line:

Add tsconfig-paths/register to ts-node so @framework aliases resolve when running suites directly
