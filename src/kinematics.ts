import type { JointConfig, Pose } from "./model";

export type Matrix4 = number[][];

export type FrameState = {
  index: number;
  label: string;
  transform: Matrix4;
  origin: [number, number, number];
};

export type KinematicsResult = {
  frames: FrameState[];
  pose: Pose;
  matrix: Matrix4;
};

export function degToRad(value: number): number {
  return (value * Math.PI) / 180;
}

export function radToDeg(value: number): number {
  return (value * 180) / Math.PI;
}

export function identityMatrix(): Matrix4 {
  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];
}

export function multiplyMatrix4(left: Matrix4, right: Matrix4): Matrix4 {
  const result = identityMatrix().map((row) => row.map(() => 0));

  for (let rowIndex = 0; rowIndex < 4; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < 4; columnIndex += 1) {
      let sum = 0;

      for (let termIndex = 0; termIndex < 4; termIndex += 1) {
        sum += left[rowIndex][termIndex] * right[termIndex][columnIndex];
      }

      result[rowIndex][columnIndex] = sum;
    }
  }

  return result;
}

export function createDhTransform(
  a: number,
  alphaDeg: number,
  d: number,
  thetaDeg: number
): Matrix4 {
  const alpha = degToRad(alphaDeg);
  const theta = degToRad(thetaDeg);
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const cosAlpha = Math.cos(alpha);
  const sinAlpha = Math.sin(alpha);

  return [
    [cosTheta, -sinTheta * cosAlpha, sinTheta * sinAlpha, a * cosTheta],
    [sinTheta, cosTheta * cosAlpha, -cosTheta * sinAlpha, a * sinTheta],
    [0, sinAlpha, cosAlpha, d],
    [0, 0, 0, 1]
  ];
}

export function extractOrigin(transform: Matrix4): [number, number, number] {
  return [transform[0][3], transform[1][3], transform[2][3]];
}

export function extractEulerDeg(transform: Matrix4): {
  rollDeg: number;
  pitchDeg: number;
  yawDeg: number;
} {
  const sy = Math.sqrt(
    transform[0][0] * transform[0][0] + transform[1][0] * transform[1][0]
  );
  const singular = sy < 1e-6;

  let roll = 0;
  let pitch = 0;
  let yaw = 0;

  if (!singular) {
    roll = Math.atan2(transform[2][1], transform[2][2]);
    pitch = Math.atan2(-transform[2][0], sy);
    yaw = Math.atan2(transform[1][0], transform[0][0]);
  } else {
    roll = Math.atan2(-transform[1][2], transform[1][1]);
    pitch = Math.atan2(-transform[2][0], sy);
    yaw = 0;
  }

  return {
    rollDeg: radToDeg(roll),
    pitchDeg: radToDeg(pitch),
    yawDeg: radToDeg(yaw)
  };
}

export function solveForwardKinematics(
  joints: JointConfig[],
  jointAnglesDeg: number[]
): KinematicsResult {
  let currentTransform = identityMatrix();
  const frames: FrameState[] = [
    {
      index: 0,
      label: "Base",
      transform: currentTransform,
      origin: [0, 0, 0]
    }
  ];

  joints.forEach((joint, index) => {
    const thetaDeg = jointAnglesDeg[index] + joint.thetaOffsetDeg;
    const localTransform = createDhTransform(
      joint.a,
      joint.alphaDeg,
      joint.d,
      thetaDeg
    );

    currentTransform = multiplyMatrix4(currentTransform, localTransform);
    frames.push({
      index: index + 1,
      label: joint.label,
      transform: currentTransform,
      origin: extractOrigin(currentTransform)
    });
  });

  const origin = extractOrigin(currentTransform);
  const orientation = extractEulerDeg(currentTransform);

  return {
    frames,
    matrix: currentTransform,
    pose: {
      x: origin[0],
      y: origin[1],
      z: origin[2],
      rollDeg: orientation.rollDeg,
      pitchDeg: orientation.pitchDeg,
      yawDeg: orientation.yawDeg
    }
  };
}
