class PriorityQueue {
  constructor() {
    this.nodes = [];
  }
  enqueue(element, priority) {
    this.nodes.push({ element, priority });
    this.nodes.sort((a, b) => a.priority - b.priority);
  }
  dequeue() {
    return this.nodes.shift();
  }
  isEmpty() {
    return this.nodes.length === 0;
  }
}

const SURFACE_PENALTIES = {
  tarmac: 1.0,
  stone: 1.25,
  unpaved: 1.6
};

/**
 * Calculates both Shortest Distance and Fastest Time routes.
 */
function calculateRoutes(graphNodes, edges, startNodeId, endNodeId) {
  const adjacencyList = {};
  
  graphNodes.forEach(n => { adjacencyList[n.id] = []; });

  edges.forEach(edge => {
    if (edge.is_closed) return; // Completely skip blocked roads
 
    const surfacePenalty = SURFACE_PENALTIES[edge.surface_type] || 1.0;
    const baseTimeMinutes = (edge.distance_km / edge.speed_limit_kmh) * 60;
    
    // Dynamic weight considering traffic congestion multiplier and surface penalty
    const dynamicTimeCost = baseTimeMinutes * parseFloat(edge.congestion_factor) * surfacePenalty;
    const distanceCost = parseFloat(edge.distance_km);

    // Bi-directional graph building
    adjacencyList[edge.source_node_id].push({ node: edge.target_node_id, distance: distanceCost, time: dynamicTimeCost, edgeInfo: edge });
    adjacencyList[edge.target_node_id].push({ node: edge.source_node_id, distance: distanceCost, time: dynamicTimeCost, edgeInfo: edge });
  });

  const runDijkstra = (costMetric) => {
    const distances = {};
    const previous = {};
    const pq = new PriorityQueue();

    graphNodes.forEach(node => {
      distances[node.id] = Infinity;
      previous[node.id] = null;
    });

    distances[startNodeId] = 0;
    pq.enqueue(startNodeId, 0);

    while (!pq.isEmpty()) {
      const { element: current } = pq.dequeue();

      if (current === endNodeId) break;

      (adjacencyList[current] || []).forEach(neighbor => {
        const alt = distances[current] + neighbor[costMetric];
        if (alt < distances[neighbor.node]) {
          distances[neighbor.node] = alt;
          previous[neighbor.node] = { nodeId: current, edge: neighbor.edgeInfo };
          pq.enqueue(neighbor.node, alt);
        }
      });
    }

    // Reconstruction
    const path = [];
    let curr = endNodeId;
    let totalDist = 0;
    let totalTime = 0;

    while (previous[curr]) {
      const prevStep = previous[curr];
      path.unshift(curr);
      totalDist += parseFloat(prevStep.edge.distance_km);
      
      const surfacePenalty = SURFACE_PENALTIES[prevStep.edge.surface_type] || 1.0;
      const baseTimeMinutes = (prevStep.edge.distance_km / prevStep.edge.speed_limit_kmh) * 60;
      totalTime += baseTimeMinutes * parseFloat(prevStep.edge.congestion_factor) * surfacePenalty;

      curr = prevStep.nodeId;
    }
    if (path.length > 0) path.unshift(startNodeId);

    return { path, totalDistanceKm: totalDist.toFixed(2), totalTimeMinutes: Math.round(totalTime) };
  };

  return {
    fastestRoute: runDijkstra('time'),
    shortestRoute: runDijkstra('distance')
  };
}

module.exports = { calculateRoutes };