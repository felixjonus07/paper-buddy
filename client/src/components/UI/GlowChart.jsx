import React from 'react';
import './GlowChart.css';

const GlowChartNode = ({ node, allNodes }) => {
  // Find all children where parentGroup matches this node's ID
  const children = allNodes.filter(n => {
    if (!n.parentGroup) return false;
    // Check if it's populated object or string ID
    const parentId = typeof n.parentGroup === 'object' ? n.parentGroup._id : n.parentGroup;
    return parentId === node._id;
  });
  
  return (
    <li>
      <div className="glow-node">
        <h4>{node.name}</h4>
        {node.description && <p>{node.description}</p>}
      </div>
      {children.length > 0 && (
        <ul>
          {children.map(child => (
            <GlowChartNode key={child._id} node={child} allNodes={allNodes} />
          ))}
        </ul>
      )}
    </li>
  );
};

const GlowChart = ({ groups, rootGroupId }) => {
  // Ensure we have data
  if (!groups || groups.length === 0) return <p style={{textAlign: 'center'}}>No groups found.</p>;

  // Determine root nodes. If rootGroupId is passed, that's the only root.
  // Otherwise, fallback to groups with no parentGroup.
  let rootNodes = [];
  if (rootGroupId) {
    const root = groups.find(g => g._id === rootGroupId);
    if (root) rootNodes = [root];
  } else {
    rootNodes = groups.filter(g => !g.parentGroup);
  }

  if (rootNodes.length === 0) {
    return <p style={{textAlign: 'center'}}>No root groups found for this tree.</p>;
  }

  return (
    <div className="glow-chart-container tree">
      <ul>
        {rootNodes.map(root => (
          <GlowChartNode key={root._id} node={root} allNodes={groups} />
        ))}
      </ul>
    </div>
  );
};

export default GlowChart;
