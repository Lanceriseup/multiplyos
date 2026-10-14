// Route + GHL-client tests. `fetch` is replaced for every test, so nothing
// here can reach GoHighLevel; the env values are placeholders.
import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import { POST as postLead } from "../app/api/lead/route";
import { POST as postCoachingLead } from "../app/api/coaching-lead/route";
import { upsertContact } from "../lib/ghl";
import { CONTACT_NAME_MISSING, FIRST_LAST_REQUIRED_ERROR, NAME_REQUIRED_ERROR } from "../lib/contact-name";

const realFetch = globalThis.fetch;
const realConsoleError = console.error;
const ENV_KEYS = ["GHL_PRIVATE_TOKEN", "GHL_LOCATION_ID", "GHL_INBOUND_WEBHOOK_URL", "GHL_CALENDAR_URL", "GHL_COACHING_CALENDAR_URL"];
const savedEnv = {};

let calls;
let errors;

beforeEach(() => {
  calls = [];
  errors = [];
  for (const k of ENV_KEYS) savedEnv[k] = process.env[k];
  process.env.GHL_PRIVATE_TOKEN = "test-token";
  process.env.GHL_LOCATION_ID = "test-location";
  process.env.GHL_INBOUND_WEBHOOK_URL = "https://hooks.test.invalid/webhook-trigger/x";
  delete process.env.GHL_CALENDAR_URL;
  delete process.env.GHL_COACHING_CALENDAR_URL;
  globalThis.fetch = async (url, init = {}) => {
    const body = init.body ? JSON.parse(init.body) : undefined;
    calls.push({ url: String(url), method: init.method, body });
    if (String(url).endsWith("/contacts/upsert")) {
      return Response.json({ new: true, contact: { id: "contact_123" } });
    }
    return Response.json({ ok: true });
  };
  console.error = (...args) => errors.push(args);
});

afterEach(() => {
  globalThis.fetch = realFetch;
  console.error = realConsoleError;
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
});

function jsonRequest(path, body) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---- /api/lead (demo modal + contact page) --------------------------------

for (const name of [undefined, "", "   ", "\t\n", 42]) {
  test(`/api/lead rejects name ${JSON.stringify(name)} with 400 and writes nothing`, async () => {
    const res = await postLead(jsonRequest("/api/lead", { name, email: "lead@example.com", source: "Demo Request" }));
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { ok: false, error: NAME_REQUIRED_ERROR });
    assert.equal(calls.length, 0, "no GHL call on a blank name");
  });
}

test("/api/lead upserts the split, trimmed name", async () => {
  const res = await postLead(jsonRequest("/api/lead", { name: "  Jordan   Lee ", email: "lead@example.com", source: "Contact Form" }));
  assert.equal(res.status, 200);
  const upsert = calls.find((c) => c.url.endsWith("/contacts/upsert"));
  assert.ok(upsert, "upsert called");
  assert.equal(upsert.body.firstName, "Jordan");
  assert.equal(upsert.body.lastName, "Lee");
  assert.equal(errors.some((e) => e[0] === CONTACT_NAME_MISSING), false);
});

test("/api/lead accepts a single-word name (first name only)", async () => {
  const res = await postLead(jsonRequest("/api/lead", { name: "Jordan", email: "lead@example.com" }));
  assert.equal(res.status, 200);
  const upsert = calls.find((c) => c.url.endsWith("/contacts/upsert"));
  assert.equal(upsert.body.firstName, "Jordan");
  assert.equal(upsert.body.lastName, undefined);
});

// ---- /api/coaching-lead ----------------------------------------------------

for (const [firstName, lastName] of [
  ["", ""],
  ["   ", "Lee"],
  ["Jordan", "  "],
  [undefined, "Lee"],
  ["Jordan", undefined],
]) {
  test(`/api/coaching-lead rejects first=${JSON.stringify(firstName)} last=${JSON.stringify(lastName)} before the webhook or upsert`, async () => {
    const res = await postCoachingLead(
      jsonRequest("/api/coaching-lead", { firstName, lastName, email: "coach@example.com", organization: "Acme" })
    );
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { ok: false, error: FIRST_LAST_REQUIRED_ERROR });
    assert.equal(calls.length, 0, "neither the inbound webhook nor the upsert ran");
  });
}

test("/api/coaching-lead sends trimmed first/last to the webhook and the upsert", async () => {
  const res = await postCoachingLead(
    jsonRequest("/api/coaching-lead", { firstName: " Jordan ", lastName: " Lee ", email: "coach@example.com" })
  );
  assert.equal(res.status, 200);
  const hook = calls.find((c) => c.url.startsWith("https://hooks.test.invalid/"));
  const upsert = calls.find((c) => c.url.endsWith("/contacts/upsert"));
  assert.equal(hook.body.firstName, "Jordan");
  assert.equal(hook.body.lastName, "Lee");
  assert.equal(hook.body.name, "Jordan Lee");
  assert.equal(upsert.body.firstName, "Jordan");
  assert.equal(upsert.body.lastName, "Lee");
});

// ---- upsertContact marker (defence in depth) -------------------------------

test("upsertContact still writes a name-less contact but logs the marker with the id only", async () => {
  const { contactId } = await upsertContact({ email: "someone@example.com", tags: ["x"] });
  assert.equal(contactId, "contact_123");
  assert.equal(calls.filter((c) => c.url.endsWith("/contacts/upsert")).length, 1, "the contact is still written");
  const logged = errors.find((e) => e[0] === CONTACT_NAME_MISSING);
  assert.ok(logged, "marker logged at error level");
  assert.deepEqual(logged[1], { contactId: "contact_123" });
  assert.equal(JSON.stringify(errors).includes("someone@example.com"), false, "no email in the log");
});

test("upsertContact logs nothing when a name is present", async () => {
  await upsertContact({ email: "someone@example.com", firstName: "Jordan" });
  assert.equal(errors.length, 0);
});

// ---- tags never overwrite an existing contact's tags -----------------------

test("upsertContact sends tags via add-tags, not on the upsert (which would overwrite them)", async () => {
  await upsertContact({ email: "someone@example.com", firstName: "Jordan", tags: ["a", "b"] });
  const upsert = calls.find((c) => c.url.endsWith("/contacts/upsert"));
  assert.equal("tags" in upsert.body, false, "no tags on the upsert body");
  const addTags = calls.find((c) => c.url.endsWith("/contacts/contact_123/tags"));
  assert.ok(addTags, "add-tags called");
  assert.equal(addTags.method, "POST");
  assert.deepEqual(addTags.body, { tags: ["a", "b"] });
  assert.ok(calls.indexOf(upsert) < calls.indexOf(addTags), "tags added after the contact exists");
});

test("upsertContact makes no add-tags call when there are no tags", async () => {
  await upsertContact({ email: "someone@example.com", firstName: "Jordan" });
  assert.equal(calls.some((c) => c.url.endsWith("/tags")), false);
});

test("a failed add-tags call still saves the lead", async () => {
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method });
    if (String(url).endsWith("/contacts/upsert")) return Response.json({ contact: { id: "contact_123" } });
    if (String(url).endsWith("/tags")) return new Response("nope", { status: 422 });
    return Response.json({ ok: true });
  };
  const res = await postLead(jsonRequest("/api/lead", { name: "Jordan Lee", email: "lead@example.com", event: "rukcon" }));
  assert.equal(res.status, 200);
  assert.equal((await res.json()).contactId, "contact_123");
  assert.ok(errors.some((e) => String(e[0]).includes("add-tags failed")), "failure logged");
});

// ---- event attribution (QR links like /rukcon) -----------------------------

function addedTags() {
  return calls.find((c) => c.url.endsWith("/contacts/contact_123/tags"))?.body.tags;
}

test("/api/lead tags an approved event, normalising case and spaces", async () => {
  const res = await postLead(
    jsonRequest("/api/lead", { name: "Jordan Lee", email: "lead@example.com", source: "Demo Request", event: " RUKCON " })
  );
  assert.equal(res.status, 200);
  assert.deepEqual(addedTags(), ["website-lead", "demo-request", "rukcon"]);
  const note = calls.find((c) => c.url.endsWith("/notes"));
  assert.match(note.body.body, /^Event: rukcon$/m);
});

for (const event of ["vip", "rukcon2", "", 42, null]) {
  test(`/api/lead ignores unapproved event ${JSON.stringify(event)}`, async () => {
    const res = await postLead(
      jsonRequest("/api/lead", { name: "Jordan Lee", email: "lead@example.com", source: "Demo Request", event })
    );
    assert.equal(res.status, 200);
    assert.deepEqual(addedTags(), ["website-lead", "demo-request"]);
  });
}
