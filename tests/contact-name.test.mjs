import test from "node:test";
import assert from "node:assert/strict";

import { CONTACT_NAME_MISSING, cleanName, splitFullName } from "../lib/contact-name";

test("marker is the fixed repo-specific string", () => {
  assert.equal(CONTACT_NAME_MISSING, "MULTIPLYOS_WEBSITE_CONTACT_NAME_MISSING");
});

test("cleanName trims and collapses whitespace", () => {
  assert.equal(cleanName("  Jordan   Lee \n"), "Jordan Lee");
});

test("cleanName: blank, whitespace-only and non-strings are empty", () => {
  for (const v of ["", "   ", "\t\n ", undefined, null, 42, {}, ["Jordan"]]) {
    assert.equal(cleanName(v), "", `value ${JSON.stringify(v)}`);
  }
});

test("splitFullName splits first word from the rest", () => {
  assert.deepEqual(splitFullName(" Jordan  Lee Smith "), { firstName: "Jordan", lastName: "Lee Smith" });
  assert.deepEqual(splitFullName("Jordan"), { firstName: "Jordan", lastName: "" });
  assert.deepEqual(splitFullName("   "), { firstName: "", lastName: "" });
  assert.deepEqual(splitFullName(undefined), { firstName: "", lastName: "" });
});
