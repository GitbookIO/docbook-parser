var _ = require('lodash');

// Return flattened text from element or from element.children
function extractElementText(element) {
    if (!element.children) return formatText(element.data);

    return _.chain(element.children)
        .flatten(true)
        .filter('type', 'text')
        .map(function(el) {
            return formatText(el.data);
        })
        .value()
        .join('\n');
}

function formatText(text) {
    return text.replace(/[\n\t\s]+/g, ' ').trim();
}

module.exports = {
    extractElementText: extractElementText,
    formatText: formatText
};