import { MAX_TEXT_LENGTH } from '../consts';

export const cutOffText = (text: string) =>
  text.length >= MAX_TEXT_LENGTH ? text.substr(0, MAX_TEXT_LENGTH - 1) : text;
