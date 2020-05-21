import {
  assertEquals,
  assertThrowsAsync,
} from "https://deno.land/std@0.51.0/testing/asserts.ts";

import { buildHtmlAndSerialize } from "./utils.ts";

Deno.test("if attribute should be properly computed", async () => {
  // no value given to attribute
  await assertThrowsAsync(async () => {
    await buildHtmlAndSerialize("<p if />", {});
  });
  // unknown context value
  await assertThrowsAsync(async () => {
    await buildHtmlAndSerialize('<p if="unknownVal" />', {});
  });

  // simple
  assertEquals(await buildHtmlAndSerialize('<p if="true" />', {}), "<p />");
  assertEquals(await buildHtmlAndSerialize('<p if="false" />', {}), "");

  // with value computed from context
  assertEquals(
    await buildHtmlAndSerialize('<p if="show" />', { show: true }),
    "<p />",
  );
  assertEquals(
    await buildHtmlAndSerialize('<p if="!show" />', { show: true }),
    "",
  );

  // nested
  assertEquals(
    await buildHtmlAndSerialize('<div><p if="true" /></div>', {}),
    "<div ><p /></div>",
  );
  assertEquals(
    await buildHtmlAndSerialize('<div><p if="false" /></div>', {}),
    "<div ></div>",
  );

  // nested with value computed from context
  assertEquals(
    await buildHtmlAndSerialize('<div><p if="show" /></div>', { show: true }),
    "<div ><p /></div>",
  );
  assertEquals(
    await buildHtmlAndSerialize('<div><p if="!show" /></div>', { show: true }),
    "<div ></div>",
  );

  // based on context value given by a for/of
  assertEquals(
    await buildHtmlAndSerialize(
      '<p if="show" for="show" of="[true, false]" />',
      {},
    ),
    "<p />",
  );

  // nested and based on context value given by a for/of
  assertEquals(
    await buildHtmlAndSerialize(
      '<div><p if="show" for="show" of="[true, false]" /></div>',
      {},
    ),
    "<div ><p /></div>",
  );
});
