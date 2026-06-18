/** Asset path helper — bundled feed imagery lives in /public/feed.
 * Pass through absolute URLs unchanged. */
export const feedAsset = (name: string): string =>
  /^https?:\/\//i.test(name) ? name : `/feed/${name}`;
