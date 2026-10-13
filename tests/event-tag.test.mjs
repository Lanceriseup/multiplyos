import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import { eventTag, rememberEvent, recalledEvent } from "../lib/event-tag";

const DAY = 24 * 60 * 60 * 1000;
const realNow = Date.now;
let store;

beforeEach(() => {
  store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
});

afterEach(() => {
  delete globalThis.localStorage;
  Date.now = realNow;
});

test("eventTag accepts approved events only", () => {
  assert.equal(eventTag("rukcon"), "rukcon");
  assert.equal(eventTag("  RukCon "), "rukcon");
  for (const v of ["", "vip", "rukcon-2025", undefined, null, 1, {}]) {
    assert.equal(eventTag(v), undefined, JSON.stringify(v));
  }
});

test("a remembered event is recalled within 30 days", () => {
  rememberEvent("rukcon");
  Date.now = () => realNow() + 29 * DAY;
  assert.equal(recalledEvent(), "rukcon");
});

test("a remembered event expires after 30 days and is cleared", () => {
  rememberEvent("rukcon");
  Date.now = () => realNow() + 31 * DAY;
  assert.equal(recalledEvent(), undefined);
  assert.equal(store.size, 0);
});

test("a tampered stored value is not trusted", () => {
  store.set("mos_event", JSON.stringify({ tag: "vip", at: Date.now() }));
  assert.equal(recalledEvent(), undefined);
  store.set("mos_event", "not json");
  assert.equal(recalledEvent(), undefined);
});

test("blocked storage never throws", () => {
  globalThis.localStorage = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
    removeItem() { throw new Error("blocked"); },
  };
  assert.doesNotThrow(() => rememberEvent("rukcon"));
  assert.equal(recalledEvent(), undefined);
});
