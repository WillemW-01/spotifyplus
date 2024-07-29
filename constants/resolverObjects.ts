export interface SettingsObjectType {
  values: {
    [key: string]: number;
  };
  params: {
    [key: string]: {
      min: number;
      max: number;
      step: number;
    };
  };
  labels: string[];
}

// prettier-ignore
const resolverBarnesHut = {
  values: {
    theta: 0.5,
    gravitationalConstant: -2000,
    centralGravity: 0.3,
    springLength: 95,
    springConstant: 0.04,
    damping: 0.09,
    avoidOverlap: 0,
  },
  params: {
    theta: { min: 0.01, max: 5, step: 0.01, },
    gravitationalConstant: { min: -50000, max: 0, step: 100, },
    centralGravity: { min: 0.01, max: 5, step: 0.01, },
    springLength: { min: 0, max: 500, step: 2, },
    springConstant: { min: 0.001, max: 0.5, step: 0.005, },
    damping: { min: 0.0, max: 1.0, step: 0.01, },
    avoidOverlap: { min: 0, max: 1, step: 0.01, },
  },
  labels: [
    "theta",
    "gravitationalConstant",
    "centralGravity",
    "springLength",
    "springConstant",
    "damping",
    "avoidOverlap",
  ],
} as SettingsObjectType;

// prettier-ignore
const resolverForceAtlas = {
  values: {
    theta: 0.5,
    gravitationalConstant: -50,
    centralGravity: 0.01,
    springConstant: 0.08,
    springLength: 100,
    damping: 0.4,
    avoidOverlap: 0
  },
  params: {
    theta: { min: 0.01, max: 5, step: 0.01, },
    gravitationalConstant: { min: -1000, max: 10, step: 10, },
    centralGravity: { min: 0.001, max: 0.05, step: 0.001, },
    springLength: { min: 0, max: 500, step: 5, },
    springConstant: { min: 0.001, max: 0.5, step: 0.005, },
    damping: { min: 0.0, max: 1.0, step: 0.01, },
    avoidOverlap: { min: 0, max: 1, step: 0.01, },
  },
  labels: [
    "theta",
    "gravitationalConstant",
    "centralGravity",
    "springLength",
    "springConstant",
    "damping",
    "avoidOverlap",
  ],
} as SettingsObjectType;

const resolverRepulsion = {
  values: {
    theta: 0.5,
    gravitationalConstant: -2000,
    centralGravity: 0.3,
    springLength: 95,
    springConstant: 0.04,
    damping: 0.09,
    avoidOverlap: 0,
  },
  params: {
    theta: {
      min: 0,
      max: 1,
      step: 0.01,
    },
  },
  labels: [
    "theta",
    "gravitationalConstant",
    "centralGravity",
    "springLength",
    "springConstant",
    "damping",
    "avoidOverlap",
  ],
} as SettingsObjectType;

const resolverHierarchyRepulsion = {
  values: {
    theta: 0.5,
    gravitationalConstant: -2000,
    centralGravity: 0.3,
    springLength: 95,
    springConstant: 0.04,
    damping: 0.09,
    avoidOverlap: 0,
  },
  params: {
    theta: {
      min: 0,
      max: 1,
      step: 0.01,
    },
  },
  labels: [
    "theta",
    "gravitationalConstant",
    "centralGravity",
    "springLength",
    "springConstant",
    "damping",
    "avoidOverlap",
  ],
} as SettingsObjectType;

export const resolvers = {
  barnesHut: resolverBarnesHut,
  forceAtlas2Based: resolverForceAtlas,
  repulsion: resolverRepulsion,
  hierarchicalRepulsion: resolverHierarchyRepulsion,
} as {
  [key: string]: SettingsObjectType;
};
