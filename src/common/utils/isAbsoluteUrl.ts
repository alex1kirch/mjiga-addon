export default function isAbsoluteUrl(url: string) {
  return 0 == url.indexOf('//') || !!~url.indexOf('://');
}
