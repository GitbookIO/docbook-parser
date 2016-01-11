var _ = require('lodash');
var htmlparser = require('htmlparser');
var inspect = require('util').inspect;

var utils = require('./utils');
var Chapter = require('./Chapter');

var allowedTypes = {
    book: {
        chapterType: 'chapter'
    },
    article: {
        chapterType: 'section'
    }
};

function Docbook(xmlString) {
    var that = this;

    // Define htmlparser hanlder and options
    var parserOpts = {
        verbose: false,
        ignoreWhitespace: true,
        enforceEmptyTags: true
    };

    var handler = new htmlparser.DefaultHandler(
        function(err, dom) {
            if (err) {
                console.log(err.stack);
                throw err;
            }

            that.elements = dom;
        },
        parserOpts
    );

    that.parser = new htmlparser.Parser(handler);
    that._xml = xmlString;
    that.parse();
}

Docbook.prototype.validateFormat = function() {
    // Document should only contain the main <book> or <article> document tag
    // Plus an optional <?xml> directive
    if (this.elements.length < 1 ||
        this.elements.length > 2 ||
        _.filter(this.elements, 'type', 'tag').length > 1) {
        throw new Error('A Docbook should only contain a main element tag, plus an optionnal xml directive.');
    }

    // Set Docbook root element
    var rootIndex = _.findIndex(this.xml, 'type', 'tag');
    var root = this.elements.splice(rootIndex, 1);
    this.root = root[0];

    // Set Docbook type and validate
    this.type = this.root.name;
    if (_.isUndefined(allowedTypes[this.type])) {
        throw new Error('The Docbook main element should be one of: '+_.keys(allowedTypes));
    }

    // Set xml directive if any
    if (!!this.elements.length) {
        this.xmlDirective = this.elements[0];
    }
};

Docbook.prototype.getTitle = function(first_argument) {
    // Set Docbook main title
    var target = _.isUndefined(this.informations)? this.root : this.informations;

    var title = _.find(target.children, 'name', 'title');
    if (!!title) this.title = title.children[0].data;
    var subtitle = _.find(target.children, 'name', 'subtitle');
    if (!!subtitle) this.subtitle = subtitle.children[0].data;
};

Docbook.prototype.hasInfo = function() {
    var infoIndex = _.findIndex(this.root.children, 'name', 'info');
    return infoIndex >= 0;
};

Docbook.prototype.getInfo = function() {
    if (!this.hasInfo()) return;

    // Set Docbook informations
    var infoIndex = _.findIndex(this.root.children, 'name', 'info');

    var infoTag = this.root.children.splice(infoIndex, 1);
    this.informations = infoTag[0];

    this.getLegalNotice();
};

Docbook.prototype.extractLegalNotice = function() {
// Set legal notice by extracting each <para> elements text
Docbook.prototype.getLegalNotice = function() {
    var legalNoticeElement = _.find(this.informations.children, 'name', 'legalnotice');
    if (!legalNoticeElement) return;

    this.legalNotice = _.chain(legalNoticeElement.children)
        .filter(function(element) {
            var paragraphs = ['para', 'simpara', 'formalpara'];
            return _.includes(paragraphs, element.name);
        })
        .map(function(element) {
            return utils.extractElementText(element);
        })
        .value()
        .join('\n');
};

Docbook.prototype.parseChapters = function() {
    var chapterType = allowedTypes[this.type].chapterType;
    this.chapters = _.chain(this.root.children)
        .filter(function(element) {
            return element.type === 'tag' && element.name === chapterType;
        })
        .map(function(element) {
             return new Chapter(element);
        })
        .value();

    // console.log(this.chapters);
};

Docbook.prototype.parse = function() {
    this.parser.parseComplete(this._xml);
    this.validateFormat();
    this.getInfo();
    this.getTitle();
    this.parseChapters();
};

module.exports = Docbook;