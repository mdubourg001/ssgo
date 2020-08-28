import {
  assertEquals,
  assertThrowsAsync,
} from "https://deno.land/std@0.66.0/testing/asserts.ts";

import { buildHtmlAndSerialize } from "./utils.ts";

Deno.test("for/of attribute should be properly computed", async () => {
  // no of paired
  await assertThrowsAsync(async () => {
    await buildHtmlAndSerialize('<p for="foo" />', {});
  });
  // no for paired
  await assertThrowsAsync(async () => {
    await buildHtmlAndSerialize('<p of="bar" />', {});
  });
  // no value given to of
  await assertThrowsAsync(async () => {
    await buildHtmlAndSerialize('<p for="foo" of />', {});
  });
  // no value given to for
  await assertThrowsAsync(async () => {
    await buildHtmlAndSerialize('<p for of="bar" />', {});
  });
  // invalid syntax
  await assertThrowsAsync(async () => {
    await buildHtmlAndSerialize(`<p for="foo" of="["aaa"]" />`, {});
  });
  // value given to for isn't an iterable
  await assertThrowsAsync(async () => {
    await buildHtmlAndSerialize(`<p for="foo" of="{foo: 1}"/>`, {});
  });

  // simple
  assertEquals(
    await buildHtmlAndSerialize(
      `<p for="item" of="['foo', 'bar']">{{ index }} - {{ item }}</p>`,
      {},
    ),
    "<p>0 - foo</p><p>1 - bar</p>",
  );

  // with value computed from context
  assertEquals(
    await buildHtmlAndSerialize(
      `<p for="item" of="items">{{ index }} - {{ item }}</p>`,
      { items: ["foo", "bar"] },
    ),
    "<p>0 - foo</p><p>1 - bar</p>",
  );
  assertEquals(
    await buildHtmlAndSerialize(
      `<p for="item" of="items">{{ index }} - {{ item }} - {{ item === superItem }}</p>`,
      { items: ["foo", "bar"], superItem: "bar" },
    ),
    "<p>0 - foo - false</p><p>1 - bar - true</p>",
  );

  // nested
  assertEquals(
    await buildHtmlAndSerialize(
      `<div><p for="item" of="['foo', 'bar']">{{ index }} - {{ item }}</p></div>`,
      {},
    ),
    "<div><p>0 - foo</p><p>1 - bar</p></div>",
  );

  // nested with value computed from context
  assertEquals(
    await buildHtmlAndSerialize(
      `<div><p for="item" of="items">{{ index }} - {{ item }} - {{ item === superItem }}</p></div>`,
      { items: ["foo", "bar"], superItem: "bar" },
    ),
    "<div><p>0 - foo - false</p><p>1 - bar - true</p></div>",
  );
});
