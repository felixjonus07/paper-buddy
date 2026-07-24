import React from 'react';
import './GlowChart.css';

const GlowChartNode = ({ node, allNodes, targetLineage = [], isTargetOrDescendant = false, targetGroupId = null, _visited = [] }) => {
  // Prevent infinite cycles in component rendering
  if (_visited.includes(node._id)) {
    return null; // Stop rendering if we've seen this node in the current path
  }
  const currentVisited = [..._visited, node._id];

  // Find all children where parentGroups includes this node's ID
  let children = allNodes.filter(n => {
    if (!n.parentGroups || !Array.isArray(n.parentGroups)) return false;
    return n.parentGroups.some(p => {
      const parentId = (p && typeof p === 'object') ? p._id : p;
      return parentId === node._id;
    });
  });

  // If we haven't reached the target group yet (and we aren't a descendant of it),
  // we must hide siblings and only follow the path down to the target.
  if (!isTargetOrDescendant) {
    children = children.filter(child => targetLineage.includes(child._id));
  }

  // Check if current node is the target group to visually highlight it
  const isTarget = node._id === targetGroupId;

  return (
    <li>
      <div className={`glow-node ${isTarget ? 'glow-node-target' : ''}`} style={isTarget ? { boxShadow: '0 0 25px var(--primary)' } : {}}>
        <h4>{node.name}</h4>
        {node.description && <p>{node.description}</p>}
      </div>
      {children.length > 0 && (
        <ul>
          {children.map(child => (
            <GlowChartNode 
              key={child._id} 
              node={child} 
              allNodes={allNodes} 
              targetLineage={targetLineage}
              isTargetOrDescendant={isTargetOrDescendant || child._id === targetGroupId}
              targetGroupId={targetGroupId}
              _visited={currentVisited}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const GlowChart = ({ groups, rootGroupId }) => {
  // Ensure we have data
  if (!groups || groups.length === 0) return <p style={{textAlign: 'center'}}>No groups found.</p>;

  // Build the lineage to find the ultimate root and the path to the target
  const buildLineage = (currentId, allGroups, currentLineage = []) => {
    if (!currentId || currentLineage.includes(currentId)) return currentLineage;
    currentLineage.push(currentId);
    const node = allGroups.find(g => g._id === currentId);
    if (node && node.parentGroups && node.parentGroups.length > 0) {
      const parentId = typeof node.parentGroups[0] === 'object' ? node.parentGroups[0]._id : node.parentGroups[0];
      return buildLineage(parentId, allGroups, currentLineage);
    }
    return currentLineage;
  };

  let rootNodes = [];
  let targetLineage = [];
  
  if (rootGroupId) {
    targetLineage = buildLineage(rootGroupId, groups);
    // targetLineage is ordered from target up to ultimate root.
    const ultimateRootId = targetLineage[targetLineage.length - 1];
    const ultimateRoot = groups.find(g => g._id === ultimateRootId);
    if (ultimateRoot) {
      rootNodes = [ultimateRoot];
    }
  } else {
    // Fallback if no specific target
    rootNodes = groups.filter(g => !g.parentGroups || g.parentGroups.length === 0);
  }

  if (rootNodes.length === 0) {
    return <p style={{textAlign: 'center'}}>No root groups found for this tree.</p>;
  }

  return (
    <div className="glow-chart-container tree">
      <ul>
        {rootNodes.map(root => (
          <GlowChartNode 
            key={root._id} 
            node={root} 
            allNodes={groups} 
            targetLineage={targetLineage}
            isTargetOrDescendant={root._id === rootGroupId}
            targetGroupId={rootGroupId}
          />
        ))}
      </ul>
    </div>
  );
};

export default GlowChart;
