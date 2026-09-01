CMS.registerPreviewStyle(`
  body { background:#0B0C10; font-family:sans-serif; margin:0; padding:24px; }
  .op-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:16px; }
  .op-card { background:#101319; border:1px solid #1E2430; border-radius:10px; overflow:hidden; color:#E8ECF1; }
  .op-card img { width:100%; height:120px; object-fit:cover; display:block; background:#151923; }
  .op-body { padding:12px; }
  .op-title { font-weight:700; margin:0 0 4px; font-size:14px; }
  .op-meta { font-size:11px; color:#8A93A6; }
`);

var ProductsPreview = createClass({
  render: function() {
    var entry = this.props.entry;
    var productsData = entry.getIn(['data', 'products']);
    var items = productsData && productsData.toJS ? productsData.toJS() : [];
    return h('div', { className: 'op-grid' },
      items.map(function(p, i) {
        return h('div', { className: 'op-card', key: i },
          h('img', { src: p.thumbnail || '' }),
          h('div', { className: 'op-body' },
            h('p', { className: 'op-title' }, p.title || 'Untitled'),
            h('p', { className: 'op-meta' }, (p.category || '') + ' • ' + (p.fileSize || ''))
          )
        );
      })
    );
  }
});

CMS.registerPreviewTemplate('products', ProductsPreview);
