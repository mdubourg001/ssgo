# Loops

In order to let you build pages and components by iterating over fetched datas inside of you templates, `ssgo` provides the `for` / `of` couple of attributes.

`for` and `of` **must** be used together : an error will be thrown if of the two is missing the other.

For example, let's say that one of your [creators](/docs/about-creators.html) is triggering a build page with the following data:

```typescript
{
  posts: [
    { title: "Blog post number 1", readTime: 22, hide: false },
    { title: "Blog post number two", hide: true },
    { title: "How I built a static site generator for deno", readTime: 120, hide: false },
  ],
}
```

Then you could for example easily build the list of your posts as follows:

```html
<ul>
  <li
    for="blogpost"
    of="posts"
    eval:data-readtime="blogpost.readTime ?? 0"
    if="!blogpost.hide"
  >
    {{ index + 1 }} - {{ blogpost.title }}
  </li>
</ul>
```

Your built page would look like that:

```html
<ul>
  <li data-readtime="22">1 - Blog post number 1</li>
  <li data-readtime="120">2 - How I built a static site generator for deno</li>
</ul>
```

There are some interesting things to notice in this example:

- You can give whichever name you want to your iterator using the `for` attribute
- You can combine the use of `for` / `of` with the use of `eval` and `if` to evaluate attributes of display elements based on the current value of the iterator
- You can use an `index` key inside of the loop, it is automatically added by `ssgo` and **starts at index 0**
- Not depicted here, but you can of course also use `for` / `of` on [components](/docs/using-components.html).
