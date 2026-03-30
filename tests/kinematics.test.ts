import { describe, expect, it } from "vitest";
import {
  createDhTransform,
  degToRad,
  identityMatrix,
  multiplyMatrix4,
  radToDeg,
  solveForwardKinematics
} from "../src/kinematics";
import type { JointConfig } from "../src/model";

function expectClose(actual: number, expected: number, digits = 6) {
  expect(actual).toBeCloseTo(expected, digits);
}

describe("angle helpers", () => {
  it("converts degrees to radians", () => {
    expectClose(degToRad(180), Math.PI);
  });

  it("converts radians to degrees", () => {
    expectClose(radToDeg(Math.PI / 2), 90);
  });
});

describe("matrix helpers", () => {
  it("keeps identity when multiplied by identity", () => {
    expect(multiplyMatrix4(identityMatrix(), identityMatrix())).toEqual(
      identityMatrix()
    );
  });

  it("builds a pure x translation DH transform", () => {
    const transform = createDhTransform(1, 0, 0, 0);
    expectClose(transform[0][3], 1);
    expectClose(transform[1][3], 0);
    expectClose(transform[2][3], 0);
  });

  it("builds a 90 degree planar rotation DH transform", () => {
    const transform = createDhTransform(0, 0, 0, 90);
    expectClose(transform[0][0], 0);
    expectClose(transform[1][0], 1);
    expectClose(transform[0][1], -1);
    expectClose(transform[1][1], 0);
  });
});

describe("forward kinematics", () => {
  it("returns base plus one frame for a single joint chain", () => {
    const joints: JointConfig[] = [
      {
        id: "j1",
        label: "Joint 1",
        a: 1,
        alphaDeg: 0,
        d: 0,
        thetaOffsetDeg: 0,
        minDeg: -180,
        maxDeg: 180
      }
    ];

    const result = solveForwardKinematics(joints, [0]);
    expect(result.frames).toHaveLength(2);
    expectClose(result.pose.x, 1);
    expectClose(result.pose.y, 0);
    expectClose(result.pose.z, 0);
  });

  it("rotates a single link into the y axis at 90 degrees", () => {
    const joints: JointConfig[] = [
      {
        id: "j1",
        label: "Joint 1",
        a: 1,
        alphaDeg: 0,
        d: 0,
        thetaOffsetDeg: 0,
        minDeg: -180,
        maxDeg: 180
      }
    ];

    const result = solveForwardKinematics(joints, [90]);
    expectClose(result.pose.x, 0);
    expectClose(result.pose.y, 1);
    expectClose(result.pose.z, 0);
    expectClose(result.pose.yawDeg, 90);
  });

  it("applies theta offset during forward kinematics", () => {
    const joints: JointConfig[] = [
      {
        id: "j1",
        label: "Joint 1",
        a: 1,
        alphaDeg: 0,
        d: 0,
        thetaOffsetDeg: 90,
        minDeg: -180,
        maxDeg: 180
      }
    ];

    const result = solveForwardKinematics(joints, [0]);
    expectClose(result.pose.x, 0);
    expectClose(result.pose.y, 1);
    expectClose(result.pose.yawDeg, 90);
  });
});
