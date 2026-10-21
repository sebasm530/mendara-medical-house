import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function load(file, imports, globals = {}) {
  const target = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { module: target, exports: target.exports, require: (name) => imports[name], ...globals });
  return target.exports;
}

// Pure unit harness: no browser, DOM package, network, server or visual capture.
function experience({ reduced = false, focused = false } = {}) {
  let callback, cleanup;
  const calls = [], stopped = [], listeners = new Map();
  const preference = { matches: reduced, addEventListener: (_, fn) => listeners.set("preference", fn), removeEventListener: () => listeners.delete("preference") };
  class Element {
    constructor(group) { this.group = group; this.dataset = { motion: "rise" }; }
    animate() {}
    closest() { return this.group; }
  }
  const group = new Element();
  group.dataset = { motionGroup: "content" };
  group.contains = () => focused;
  group.querySelectorAll = () => [new Element(group), new Element(group)];
  const observed = new Set();
  class Observer {
    constructor(fn) { callback = fn; }
    observe(target) { observed.add(target); }
    unobserve(target) { observed.delete(target); }
    disconnect() { observed.clear(); }
  }
  const document = { querySelectorAll: () => [group], activeElement: null, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: (name) => listeners.delete(name) };
  const { MotionExperience } = load("src/components/motion/MotionExperience.tsx", {
    react: { useEffect: (fn) => { cleanup = fn(); } },
    "./entrance": { entrance: (...args) => { calls.push(args); return () => stopped.push(args[0]); } },
  }, { window: { matchMedia: () => preference, IntersectionObserver: Observer }, IntersectionObserver: Observer, Element, document });
  MotionExperience();
  return { calls, stopped, observed, listeners, preference, cleanup, group, enter: () => callback([{ isIntersecting: true, target: group }]), interact: (type) => listeners.get(type)({ target: new Element(group) }) };
}

test("reduced motion skips observer and every entrance", () => {
  const state = experience({ reduced: true });
  assert.equal(state.observed.size, 0);
  assert.equal(state.calls.length, 0);
  assert.equal(state.listeners.size, 0);
});

test("intersection entrances execute once and release observation", () => {
  const state = experience();
  state.enter(); state.enter();
  assert.equal(state.calls.length, 2);
  assert.equal(state.observed.size, 0);
  state.cleanup();
  assert.equal(state.stopped.length, 2);
  assert.equal(state.listeners.size, 0);
});

test("runtime reduced motion cancels active effects and observation", () => {
  const state = experience(); state.enter();
  state.preference.matches = true;
  state.listeners.get("preference")();
  assert.equal(state.stopped.length, 2);
  assert.equal(state.observed.size, 0);
  state.cleanup();
});

test("focus and pointer interaction prevent a delayed form entrance", () => {
  for (const type of ["focusin", "pointerdown"]) {
    const state = experience();
    state.interact(type); state.enter();
    assert.equal(state.calls.length, 0);
    state.cleanup();
  }
  const focused = experience({ focused: true }); focused.enter();
  assert.equal(focused.calls.length, 0);
  focused.cleanup();
});

test("interaction finishes active motion before the user edits", () => {
  const state = experience(); state.enter(); state.interact("focusin");
  assert.equal(state.stopped.length, 2);
  state.cleanup();
});

test("animation failure, completion and cancellation restore authored styles", async () => {
  for (const mode of ["failure", "completion", "cancel"]) {
    const values = new Map([["transform", "rotate(2deg)"]]);
    const style = { getPropertyValue: (key) => values.get(key) ?? "", getPropertyPriority: () => "", setProperty: (key, value) => values.set(key, value), removeProperty: (key) => values.delete(key) };
    let finish;
    const { entrance } = load("src/components/motion/entrance.ts", { "motion/mini": { animate: () => {
      if (mode === "failure") throw new Error("unsupported");
      return { then: (fn) => { finish = fn; }, cancel() {} };
    } } });
    const cancel = entrance({ style }, "line");
    if (mode === "completion") finish();
    else cancel();
    assert.equal(values.get("transform"), "rotate(2deg)");
    assert.equal(values.has("opacity"), false);
    assert.equal(values.has("transform-origin"), false);
  }
});
