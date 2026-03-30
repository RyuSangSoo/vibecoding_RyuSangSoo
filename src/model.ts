export type JointConfig = {
  id: string;
  label: string;
  a: number;
  alphaDeg: number;
  d: number;
  thetaOffsetDeg: number;
  minDeg: number;
  maxDeg: number;
};

export type Pose = {
  x: number;
  y: number;
  z: number;
  rollDeg: number;
  pitchDeg: number;
  yawDeg: number;
};

export const defaultRobot: JointConfig[] = [
  {
    id: "j1",
    label: "Joint 1",
    a: 0,
    alphaDeg: 90,
    d: 0.1625,
    thetaOffsetDeg: 0,
    minDeg: -180,
    maxDeg: 180
  },
  {
    id: "j2",
    label: "Joint 2",
    a: -0.425,
    alphaDeg: 0,
    d: 0,
    thetaOffsetDeg: 0,
    minDeg: -180,
    maxDeg: 180
  },
  {
    id: "j3",
    label: "Joint 3",
    a: -0.3922,
    alphaDeg: 0,
    d: 0,
    thetaOffsetDeg: 0,
    minDeg: -180,
    maxDeg: 180
  },
  {
    id: "j4",
    label: "Joint 4",
    a: 0,
    alphaDeg: 90,
    d: 0.1333,
    thetaOffsetDeg: 0,
    minDeg: -180,
    maxDeg: 180
  },
  {
    id: "j5",
    label: "Joint 5",
    a: 0,
    alphaDeg: -90,
    d: 0.0997,
    thetaOffsetDeg: 0,
    minDeg: -180,
    maxDeg: 180
  },
  {
    id: "j6",
    label: "Joint 6",
    a: 0,
    alphaDeg: 0,
    d: 0.0996,
    thetaOffsetDeg: 0,
    minDeg: -180,
    maxDeg: 180
  }
];

export const defaultJointAnglesDeg = [0, -90, 90, 0, 45, 0];
