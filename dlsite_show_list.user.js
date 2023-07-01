// ==UserScript==
// @name        dlsite show list
// @namespace   https://github.com/kurorinchan/dlsite-showlist
// @match       https://www.dlsite.com/*
// @grant       none
// @version     1.2
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

function toParamaterPairs(pathSplit) {
  let pairs = {}
  const equalIndex = pathSplit.indexOf("=");
  for (let i = equalIndex + 1; i < pathSplit.length; i += 2) {
    const nextIndex = i + 1;
    if (nextIndex >= pathSplit.length) {
      // This is an error because its not ending with a pair. But return
      // processed pairs.
      console.error(`Failed to process ${pathSplit[i]}.`)
      return pairs;
    }
    pairs[pathSplit[i]] = pathSplit[nextIndex];
  }
  return pairs;
}

let parameterPairs = toParamaterPairs(pathSplit);

// This function could modify the input parameter.
function needsUrlChange(paramPairs) {
  const from = paramPairs["from"];

  // Special handling.
  // from/fs.header means it's the results from the search
  // bar at the top. This always show 30 results.
  // fs.detail is from a banner.
  // So treat any from/fs.* as a special case.
  if (from.startsWith("fs.")) {
    // Always remove this to prevent infinite redirect (loop).
    // This deletion is here to not require deleting it elsewhere in the code
    // (and prevent accidental removal of this line).
    delete paramPairs["from"];
    return true;
  }

  const keyWords = [
    "per_page", "show_type",
  ];

  for (const word of keyWords) {
    if (word in paramPairs) {
      return false;
    }
  }
  return true;
}

if (!needsUrlChange(parameterPairs)) {
  return;
}

parameterPairs["per_page"] = "100";
parameterPairs["show_type"] = "1";

function toParameterArray(pairs) {
  let parameters = [];
  for (const key in pairs) {
    parameters.push(key);
    parameters.push(pairs[key]);
  }
  return parameters;
}

const newParameterPairs = toParameterArray(parameterPairs);
const newPathArray = pathSplit.slice(0, equalIndex + 1).concat(
  newParameterPairs
)

const newURL  = window.location.protocol + "//"
  + window.location.host
  + newPathArray.join('/')
  + window.location.search
  + window.location.hash;

// Simple cross check to prevent infinite redirect.
if (window.location.href == newURL) {
  return;
}

console.log("rewriting url to " + newURL);
document.location.replace(newURL);