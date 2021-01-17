import * as path from 'path';
import { URL } from 'url';
import * as slug from 'slug';
import * as cheerio from 'cheerio';

function getLinkUrl(currentUrl: string, element: cheerio.Element) {
  const parsedLink = new URL(element.attribs.href || '', currentUrl);
  const currentParsedUrl = new URL(currentUrl);
  if (parsedLink.hostname !== currentParsedUrl.hostname || !parsedLink.pathname) {
    return null;
  }
  return parsedLink.toString();
}

export function getPageLinks(currentUrl: string, body: string) {
  return Array.from(cheerio.load(body)('a'))
    .map((element) => {
      return getLinkUrl(currentUrl, element);
    })
    .filter((e): e is string => e !== null);
}

export function urlToFilename(url: string): string {
  const parsedUrl = new URL(url);
  const urlPath = parsedUrl.pathname
    .split('/')
    .filter((component) => {
      return component !== '';
    })
    .map((component) => {
      return slug(component, { remove: null });
    })
    .join('/');
  let filename = path.join(parsedUrl.hostname, urlPath);
  if (!path.extname(filename).match(/htm/)) {
    filename += '.html';
  }

  return filename;
}
