var _ = require('lodash');

// Return flattened text from element or from element.children
function extractElementText(element) {
    if (element.type === 'text')
        return formatText(element.data);

    return _.chain(element.children)
        .flatten(true)
        .map(function(el) {
            return extractElementText(el);
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