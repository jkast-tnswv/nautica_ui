// Entry point wrapper for running vitest via Bazel js_test.
// Vitest CLI is invoked by importing its programmatic API.
import { startVitest } from 'vitest/node';

const ctx = await startVitest('test', [], { run: true });
if (ctx) {
  const passed = ctx.state.getFiles().every(f => f.result?.state !== 'fail');
  await ctx.close();
  process.exit(passed ? 0 : 1);
} else {
  process.exit(1);
}
