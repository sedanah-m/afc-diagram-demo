import { useState } from 'preact/hooks';
import { Fragment } from 'preact';
import styles from './AFCFlowDiagram.module.css';

type FlowNode = {
  id: string;
  manualLabel: string;
  autoLabel?: string;
  manualCaption: string;
  autoCaption?: string;
  isSdkGroup: boolean;
  manualStep: number;
  autoStep?: number;
};
const flowNodes: FlowNode[] = [
  {
    id: 'node-1',
    manualLabel: 'Prompt Sent',
    manualCaption: 'You send the initial prompt - same call as always',
    autoCaption: 'Same call - but the declaration you passed in this time also carries a functionReference, which is what triggers everything following',
    isSdkGroup: false,
    manualStep: 1,
    autoStep: 1,
  },
  {
    id: 'node-2',
    manualLabel: 'Model: FunctionCall',
    manualCaption: 'The model pauses generation and requests a tool execution',
    isSdkGroup: true,
    manualStep: 2,
  },
  {
    id: 'node-3',
    manualLabel: 'App: Execute',
    autoLabel: 'SDK-Managed: Detect ➔ Execute ➔ Respond',
    manualCaption: 'Your code checks functionCalls, matches the name, then calls fetchWeather() itself and waits for the result',
    autoCaption: 'The SDK natively intercepts the request, runs your function, and sends the response',
    isSdkGroup: true,
    manualStep: 3,
    autoStep: 2,
  },
  {
    id: 'node-4',
    manualLabel: 'App: FunctionResponse',
    manualCaption: 'Your app sends the local function results back to the model',
    isSdkGroup: true,
    manualStep: 4,
  },
  {
    id: 'node-5',
    manualLabel: 'Final Answer',
    manualCaption: 'The model synthesizes the data and returns the final text',
    isSdkGroup: false,
    manualStep: 5,
    autoStep: 3,
  },
];
export default function AFCFlowDiagram() {
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleToggle = () => {
    setIsAutoMode(!isAutoMode);
    setPinnedId(null);
    setHoveredId(null);
  };

  const handleNodeClick = (nodeId: string) => {
    setPinnedId(prev => (prev === nodeId ? null : nodeId));
  };

  const activeNodeId = hoveredId ?? pinnedId;
  const activeNode = flowNodes.find(n => n.id === activeNodeId);
  const activeCaption = activeNode
    ? (isAutoMode && activeNode.autoCaption ? activeNode.autoCaption : activeNode.manualCaption)
    : 'Hover or tap a node to see what happens at this step.';

  return (
    <div className={styles.diagramContainer}>
      <div className={styles.header}>
        <span className={`${styles.modeText} ${!isAutoMode ? styles.activeText : ''}`}>Manual</span>
        <button
          className={`${styles.toggleBtn} ${isAutoMode ? styles.autoOn : ''}`}
          onClick={handleToggle}
          aria-label="Toggle between Manual and Automatic modes"
        >
          <div className={styles.toggleThumb} />
        </button>
        <span className={`${styles.modeText} ${isAutoMode ? styles.activeText : ''}`}>Automatic</span>
      </div>

      <div className={styles.flowTrack}>
        {flowNodes.map((node, index) => {
          const isHiddenInAuto = isAutoMode && node.isSdkGroup && node.id !== 'node-3';
          const isMergedCenter = isAutoMode && node.id === 'node-3';
          const isPinned = pinnedId === node.id;
          const isHovered = hoveredId === node.id;
          const isDimmed = pinnedId !== null && !isPinned && !isHovered;

          let nodeClasses = styles.node;
          if (node.isSdkGroup) nodeClasses += ` ${styles.sdkNode}`;
          if (isHiddenInAuto) nodeClasses += ` ${styles.hiddenNode}`;
          if (isMergedCenter) nodeClasses += ` ${styles.mergedNode}`;
          if (isDimmed) nodeClasses += ` ${styles.dimmedNode}`;
          if (isHovered && !isPinned) nodeClasses += ` ${styles.hoveredNode}`;
          if (isPinned) nodeClasses += ` ${styles.pinnedNode}`;

          const label = isMergedCenter && node.autoLabel ? node.autoLabel : node.manualLabel;
          
          const stepNum = isMergedCenter || isAutoMode ? node.autoStep : node.manualStep;
          
          const showArrow = index < flowNodes.length - 1;
          let arrowClasses = styles.arrow;
          if (isHiddenInAuto) arrowClasses += ` ${styles.hiddenArrow}`;
          if (pinnedId !== null && !isHiddenInAuto) arrowClasses += ` ${styles.dimmedArrow}`;

          return (
            <Fragment key={node.id}>
              <div
                className={nodeClasses}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(node.id)}
                onBlur={() => setHoveredId(null)}
                onClick={() => handleNodeClick(node.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNodeClick(node.id);
                  }
                }}
                tabIndex={isHiddenInAuto ? -1 : 0}
                role="button"
                aria-pressed={isPinned}
                aria-label={`${label}${stepNum ? ` - Step ${stepNum}` : ''}`}
              >
                {stepNum && (
                  <div className={styles.stepBadge}>
                    Step {stepNum}
                  </div>
                )}
                <span className={styles.nodeLabel}>{label}</span>
              </div>
              
              {showArrow && (
                <div className={arrowClasses} aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      <div className={styles.captionBox}>
        <p>{activeCaption}</p>
      </div>
    </div>
  );
}