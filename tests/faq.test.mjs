import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
const require = createRequire(import.meta.url);
function load(file, imports) {
  const target = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { module: target, exports: target.exports, require: name => imports[name] ?? require(name) });
  return target.exports;
}
function harness() {
  let state = null;
  const refs = { current: [] };
  const data = load("src/data/frequentlyAskedQuestions.ts", {});
  const { FaqAccordion } = load("src/components/FaqAccordion.tsx", {
    react: { useState: () => [state, next => { state = typeof next === "function" ? next(state) : next; }], useRef: () => refs },
    "@/data/frequentlyAskedQuestions": data,
    "./FaqSection.module.css": new Proxy({}, { get: (_, key) => key }),
  });
  function render() {
    const buttons = [], panels = [];
    function walk(node) {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) return node.forEach(walk);
      if (node.type === "button") buttons.push(node.props);
      if (node.props?.role === "region") panels.push(node.props);
      walk(node.props?.children);
    }
    walk(FaqAccordion());
    return { buttons, panels };
  }
  return { render, data };
}

test("seven questions start closed with stable accessible relationships", () => {
  const h = harness(); const { buttons, panels } = h.render();
  assert.equal(h.data.frequentlyAskedQuestions.length, 7);
  assert.equal(buttons.length, 7);
  assert.equal(panels.length, 7);
  assert.equal(h.data.frequentlyAskedQuestions[0].question, "¿Cuál es la inversión y el plazo del contrato?");
  assert.equal(h.data.frequentlyAskedQuestions[0].answer, "La inversión mensual inicia desde $1,200 + IVA, según el área del consultorio. El contrato tiene una duración de 3 años.");
  assert.equal(h.data.frequentlyAskedQuestions.some(({ question }) => question === "¿Dónde queda?"), false);
  buttons.forEach((button, i) => {
    assert.equal(button["aria-expanded"], false);
    assert.equal(button["aria-controls"], panels[i].id);
    assert.equal(panels[i]["aria-labelledby"], button.id);
    assert.equal(panels[i]["aria-hidden"], true);
    assert.equal(panels[i].inert, true);
  });
});

test("opening another answer closes the previous; repeated click closes all", () => {
  const h = harness();
  h.render().buttons[0].onClick();
  assert.equal(h.render().buttons[0]["aria-expanded"], true);
  h.render().buttons[5].onClick();
  let current = h.render();
  assert.equal(current.buttons.filter(b => b["aria-expanded"]).length, 1);
  assert.equal(current.buttons[5]["aria-expanded"], true);
  assert.equal(current.panels[0].inert, true);
  assert.equal(current.panels[5].inert, false);
  current.buttons[5].onClick();
  current = h.render();
  assert.equal(current.buttons.some(b => b["aria-expanded"]), false);
});

test("arrow keys wrap and Home/End move focus without changing expanded state", () => {
  const h = harness(); const { buttons } = h.render(); let focus = -1;
  buttons.forEach((button, i) => button.ref({ focus: () => { focus = i; } }));
  for (const [index, key, expected] of [[0,"ArrowUp",6],[6,"ArrowDown",0],[4,"Home",0],[4,"End",6]]) {
    let prevented = false;
    buttons[index].onKeyDown({ key, preventDefault: () => { prevented = true; } });
    assert.equal(prevented, true); assert.equal(focus, expected);
  }
  buttons[0].onKeyDown({ key: "Tab", preventDefault: () => assert.fail("native Tab must remain available") });
  assert.equal(h.render().buttons.some(b => b["aria-expanded"]), false);
});
