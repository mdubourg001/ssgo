import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std/testing/asserts.ts";

import { buildHtmlAndSerialize } from "./utils.ts";

Deno.test("if attribute should be properly computed", () => {
  // no value given to attribute
  assertThrows(() => buildHtmlAndSerialize("<p if />", {}));
  // unknown context value
  assertThrows(() => buildHtmlAndSerialize('<p if="unknownVal" />', {}));

  // simple
  assertEquals(buildHtmlAndSerialize('<p if="true" />', {}), "<p />");
  assertEquals(buildHtmlAndSerialize('<p if="false" />', {}), "");

  // with value computed from context
  assertEquals(
    buildHtmlAndSerialize('<p if="show" />', { show: true }),
    "<p />"
  );
  assertEquals(buildHtmlAndSerialize('<p if="!show" />', { show: true }), "");

  // nested
  assertEquals(
    buildHtmlAndSerialize('<div><p if="true" /></div>', {}),
    "<div ><p /></div>"
  );
  assertEquals(
    buildHtmlAndSerialize('<div><p if="false" /></div>', {}),
    "<div ></div>"
  );

  // nested with value computed from context
  assertEquals(
    buildHtmlAndSerialize('<div><p if="show" /></div>', { show: true }),
    "<div ><p /></div>"
  );
  assertEquals(
    buildHtmlAndSerialize('<div><p if="!show" /></div>', { show: true }),
    "<div ></div>"
  );

  // based on context value given by a for/of
  assertEquals(
    buildHtmlAndSerialize('<p if="show" for="show" of="[true, false]" />', {}),
    "<p />"
  );

  // nested and based on context value given by a for/of
  assertEquals(
    buildHtmlAndSerialize(
      '<div><p if="show" for="show" of="[true, false]" /></div>',
      {}
    ),
    "<div ><p /></div>"
  );
});
