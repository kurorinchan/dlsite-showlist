// ==UserScript==
// @name        dlsite show list
// @namespace   https://github.com/kurorinchan/dlsite-showlist
// @match       https://www.dlsite.com/*
// @grant       none
// @version     1.0
// @author      kurorinchan
// @run-at document-start
// @description Show search results as list.
// ==/UserScript==

const path = window.location.pathname;

const CATEGORY_INDEX = 1;
const TYPE_INDEX = 2;
const pathSplit = path.split("/");

// At least expect "/category/type/" in the path. When split by "/" this should
// be at least 4 entries.
if (pathSplit.length < 4) {
  // Unrecognized path type, skip.
  return;
}

// It seems like the values after the "=" are treated as pairs and the order
// is irrelevant.
// For example /param1/value1/param2/value2/ is treated the same as
// /param2/value2/param1/value1/. So in fact, the maker_id parameter does not
// have to be at the end, it could be in the middle of the URL (after the "=").
const equalIndex = pathSplit.indexOf("=");
if (equalIndex == -1) {
  return;
}

// If the type is "work" it's the item page. No need to insert parameters.
const type = pathSplit[TYPE_INDEX];
if (type == "work") {
  return;
}

const keyWords = [
  "per_page", "show_type",
]

function hasTargetParameters(split) {
  for (const word of keyWords) {
    if (split.includes(word)) {
      return true;
    }
  }
  return false;
}

if (hasTargetParameters(pathSplit)) {
  return;
}

const newPathParameters = ["per_page", "100", "show_type", "1"];

// Try to insert the new parameters right after the "=" to keep it clean.
const newPathArray = pathSplit.slice(0, equalIndex + 1).concat(
  newPathParameters).concat(
    pathSplit.slice(equalIndex + 1))

const newURL  = window.location.protocol + "//"
  + window.location.host
  + newPathArray.join('/');

console.log("rewriting url to " + newURL);
document.location.replace(newURL);