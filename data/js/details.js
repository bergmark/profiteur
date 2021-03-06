function mk(el) {
    return $(document.createElement(el));
}

Details.helpText =
    "Profiteur: A visualizer for Haskell profile files.\n"    +
    "\n"                                                      +
    "A tree browser and a tree map are available to browse\n" +
    "the profile.\n"                                          +
    "\n"                                                      +
    "Expand cost centres by clicking the chevrons in the\n"   +
    "tree browser or double-clicking them in the tree map.\n" +
    "\n"                                                      +
    "For more info: <http://github.com/jaspervdj/profiteur>.";

function Details(container, selection, sorting, zoom) {
    this.container = container;
    this.selection = selection;
    this.sorting   = sorting;
    this.zoom      = zoom;

    this.mkElement();
    selection.addChangeListener(this);
    zoom.addChangeListener(this);
}

Details.prototype.mkElement = function() {
    var _this = this;

    var canonical = mk('h1').addClass('canonical');

    var controls = mk('div').addClass('controls');

    var up = mk('button').addClass('up').text(Unicode.UP_TRIANGLE + ' parent');
    up.prop('title', 'Jump to parent node');
    controls.append(up);

    var down = mk('button').addClass('down').text(
            Unicode.DOWN_TRIANGLE + ' zoom');
    down.prop('title', 'Zoom to this node');
    controls.append(down);

    var combo = mk('select').addClass('sorting');
    for (var k in Sorting.methods) {
        combo.append(mk('option').attr('value', k)
                .text(Sorting.methods[k].name));
    }
    combo.change(function() {
        _this.sorting.setMethodByKey(combo.val());
    });
    controls.append(combo);

    var help = mk('button').text('help');
    help.click(function() {
        alert(Details.helpText);
    });
    controls.append(help);

    var table = mk('table');

    table.append(mk('tr')
            .append(mk('td').text('Module'))
            .append(mk('td').append(mk('code').addClass('module'))));

    table.append(mk('tr')
            .append(mk('td').text('Entries'))
            .append(mk('td').addClass('entries')));

    table.append(mk('tr')
            .append(mk('td').text('Time'))
            .append(mk('td').addClass('time')));

    table.append(mk('tr')
            .append(mk('td').text('Alloc'))
            .append(mk('td').addClass('alloc')));

    this.container.append(canonical);
    this.container.append(controls);
    this.container.append(table);
};

Details.prototype.render = function(node) {
    var _this = this;

    this.container.children('.canonical').text(node.getCanonicalName());

    var up = this.container.find('.up');
    up.off();
    if (node.parent) {
        up.prop('dispabled', true);
        up.click(function () {
            node.parent.select();
            if (node == _this.zoom.getZoom()) {
                _this.zoom.setZoom(node.parent);
            }
        });
    } else {
        up.prop('dispabled', false);
    }

    var down = this.container.find('.down');
    down.off();
    down.click(function () {
        _this.zoom.setZoom(node);
    });

    var time  = node.getTime();
    var alloc = node.getAlloc();

    var zoom = _this.zoom.getZoom();
    if (zoom.parent && zoom.getTime() > 0) {
        time = time * 100 / zoom.getTime();
    }
    if (zoom.parent && zoom.getAlloc() > 0) {
        alloc = alloc * 100 / zoom.getAlloc();
    }

    this.container.find('.module').text(node.getModuleName());
    this.container.find('.entries').text(node.getEntries());
    this.container.find('.time').text(time);
    this.container.find('.alloc').text(alloc);
};

Details.prototype.onChange = function() {
    var node = this.selection.getSelectedNode();
    if (node) this.render(node);
};
