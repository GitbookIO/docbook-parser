var _ = require('lodash');

var util = require('./utils');

function Chapter(element) {
    this.raw = element;
    this.getTitle();
    this.parseAttributes();
    this.children = element.children;
};

Chapter.prototype.getTitle = function() {
    var title = _.find(this.raw.children, 'name', 'title');
    this.title = util.extractElementText(title);
};

Chapter.prototype.parseAttributes = function() {
    if (!this.raw.attribs) return;

    var id = 'xml:id';
    this.id = this.raw.attribs[id];
    this.attribs = _.omit(this.raw.attribs, id);
};

module.exports = Chapter;