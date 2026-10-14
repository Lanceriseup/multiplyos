// Lets `node --test` load the app's TypeScript the way Next resolves it:
// the `@/` path alias, extensionless relative imports (`./contact-name`), and
// extensionless package subpaths (`next/server`). Node strips the types itself.
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

const root = pathToFileURL(`${process.cwd()}/`).href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    const target = specifier.startsWith("@/") ? root + specifier.slice(2) : specifier;
    try {
      return nextResolve(target, context);
    } catch (err) {
      if (/\.[cm]?[jt]sx?$/.test(target)) throw err;
      for (const ext of [".ts", ".tsx", ".js"]) {
        try {
          return nextResolve(target + ext, context);
        } catch {
          // try the next extension
        }
      }
      throw err;
    }
  },
});
