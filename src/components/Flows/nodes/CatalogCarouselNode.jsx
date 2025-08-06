import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { ShoppingCart, Pencil } from 'lucide-react';

const CatalogCarouselNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);

  const [catalogId, setCatalogId] = useState(data.catalog_id || '');
  const [headerText, setHeaderText] = useState(data.header_text || '');
  const [bodyText, setBodyText] = useState(data.body_text || '');
  const [footerText, setFooterText] = useState(data.footer_text || '');
  const [sectionTitle, setSectionTitle] = useState(data.section_title || '');
  const [retailerIds, setRetailerIds] = useState((data.retailer_ids || []).join(','));

  const handleSave = () => {
    const ids = retailerIds
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    data.catalog_id = catalogId;
    data.header_text = headerText;
    data.body_text = bodyText;
    data.footer_text = footerText;
    data.section_title = sectionTitle;
    data.retailer_ids = ids;

    setEditing(false);
  };

  return (
    <div className={`px-4 py-3 rounded-lg bg-white border ${selected ? 'border-green-400' : 'border-green-200'} min-w-[240px] max-w-[320px]`}>
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <ShoppingCart className="mr-2 text-green-600" size={16} />
          <div className="text-sm font-medium text-green-800">Catalog Carousel</div>
        </div>
        <button onClick={() => setEditing(!editing)} className="text-green-500 hover:text-green-700">
          <Pencil size={14} />
        </button>
      </div>

      {editing ? (
        <div className="space-y-2 text-xs">
          <input
            type="text"
            placeholder="Catalog ID"
            className="w-full px-2 py-1 border border-green-300 rounded"
            value={catalogId}
            onChange={(e) => setCatalogId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Header Text"
            className="w-full px-2 py-1 border border-green-300 rounded"
            value={headerText}
            onChange={(e) => setHeaderText(e.target.value)}
          />
          <input
            type="text"
            placeholder="Body Text"
            className="w-full px-2 py-1 border border-green-300 rounded"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
          />
          <input
            type="text"
            placeholder="Footer Text"
            className="w-full px-2 py-1 border border-green-300 rounded"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
          />
          <input
            type="text"
            placeholder="Section Title"
            className="w-full px-2 py-1 border border-green-300 rounded"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
          />
          <textarea
            rows={3}
            placeholder="Product Retailer IDs (comma separated)"
            className="w-full px-2 py-1 border border-green-300 rounded"
            value={retailerIds}
            onChange={(e) => setRetailerIds(e.target.value)}
          />
          <button
            className="bg-green-500 text-white text-xs px-3 py-1 rounded hover:bg-green-600"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      ) : (
        <div className="text-xs space-y-1">
          <div><strong>Catalog ID:</strong> {catalogId}</div>
          <div><strong>Header:</strong> {headerText}</div>
          <div><strong>Body:</strong> {bodyText}</div>
          <div><strong>Footer:</strong> {footerText}</div>
          <div><strong>Section:</strong> {sectionTitle}</div>
          <div><strong>Products:</strong> {retailerIds || 'None'}</div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(CatalogCarouselNode);
