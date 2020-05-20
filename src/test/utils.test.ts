import { IAttribute } from "https://cdn.pika.dev/html5parser@^1.1.0";

import {
  assertEquals,
  assertThrows,
} from "std/testing/asserts.ts";

import {
  log,
  isScript,
  isTemplate,
  contextEval,
  formatAttributes,
  interpolate,
  removeExt,
  pushBefore,
  getUnprefixedAttributeName,
  isExternalURL,
} from "../utils.ts";

Deno.test("log.error should throw when asked to", () => {
  assertThrows(() => log.error("", true), Error);
});

Deno.test("isScript", () => {
  assertEquals(isScript("script.ts"), true);
  assertEquals(isScript("script.js"), true);
  assertEquals(isScript("script.css"), false);
});

Deno.test("isTemplate", () => {
  assertEquals(isTemplate("template.html"), true);
  assertEquals(isTemplate("template.htm"), true);
  assertEquals(isTemplate("template.css"), false);
});

Deno.test("contextEval", () => {
  assertThrows(() => contextEval("foo", {}), ReferenceError);

  assertEquals(contextEval("1 + 2", {}), 3);
  assertEquals(contextEval("'foo'", {}), "foo");
  assertEquals(contextEval("foo", { foo: "bar" }), "bar");
  // objects must be inside parenthesis '()'
  assertEquals(contextEval("({ foo })", { foo: "bar" }), { foo: "bar" });
  assertEquals(
    contextEval("isScript(filename)", { isScript, filename: "script.svg" }),
    false,
  );
});

Deno.test("formatAttributes", () => {
  assertEquals(
    formatAttributes([
      {
        name: { value: "href" },
        value: { value: "https://example.com" },
      } as IAttribute,
      { name: { value: "target" }, value: { value: "_blank" } } as IAttribute,
    ]),
    `href="https://example.com" target="_blank"`,
  );
  assertEquals(
    formatAttributes([
      {
        name: { value: "href" },
        value: { value: "https://example.com" },
      } as IAttribute,
      { name: { value: "disabled" } } as IAttribute,
      { name: { value: "target" }, value: { value: "_blank" } } as IAttribute,
    ]),
    `href="https://example.com" disabled target="_blank"`,
  );
  assertEquals(
    formatAttributes([
      { name: { value: "disabled" } } as IAttribute,
      { name: { value: "hidden" } } as IAttribute,
      { name: { value: "target" }, value: { value: "_blank" } } as IAttribute,
    ]),
    `disabled hidden target="_blank"`,
  );
  assertEquals(
    formatAttributes([
      { name: { value: "disabled" } } as IAttribute,
      { name: { value: "target" }, value: { value: "_blank" } } as IAttribute,
      { name: { value: "hidden" } } as IAttribute,
    ]),
    `disabled target="_blank" hidden`,
  );
});

Deno.test("interpolate", () => {
  assertEquals(interpolate("{{ 1 + 2 }}"), "3");
  assertEquals(interpolate("{{ 'foo' }}"), "foo");
  assertEquals(interpolate("{{ foo }}", { foo: "bar" }), "bar");
  assertEquals(interpolate("{{ [1, 2, 3, 4][2] }}"), "3");
  assertEquals(
    interpolate("{{ isScript(filename) }}", {
      isScript,
      filename: "script.svg",
    }),
    "false",
  );
  assertEquals(
    interpolate("{{ foo ? foo : bar }}", { foo: "foo", bar: "bar" }),
    "foo",
  );
  assertEquals(
    interpolate("{{ typeof foo !== 'undefined' ? foo : bar }}", { bar: "bar" }),
    "bar",
  );
});

Deno.test("removeExt", () => {
  assertEquals(removeExt("script.ts"), "script");
  assertEquals(removeExt("script."), "script");
  assertEquals(removeExt("script_ts"), "");
});

Deno.test("pushBefore", () => {
  const array = ["a", "b", "d", "e"];
  pushBefore(array, "d", "c");

  assertEquals(array, ["a", "b", "c", "d", "e"]);
});

Deno.test("getUnprefixedAttributeName", () => {
  assertEquals(
    getUnprefixedAttributeName({ name: { value: "eval:href" } } as IAttribute),
    "href",
  );
});

Deno.test("isExternalURL", () => {
  assertEquals(isExternalURL("https://www.example.com"), true);
  assertEquals(isExternalURL("http://www.example.com"), true);
  assertEquals(isExternalURL("//www.example.com"), true);
  assertEquals(isExternalURL("ftp://www.example.com"), true);

  assertEquals(isExternalURL("www.example.com"), false);
  assertEquals(isExternalURL("example.com"), false);
  assertEquals(isExternalURL("assets/image.png"), false);
  assertEquals(isExternalURL("/assets//image.png/"), false);
  assertEquals(isExternalURL("image.png"), false);
});
