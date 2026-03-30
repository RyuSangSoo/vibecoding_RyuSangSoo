import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { FrameState } from "../kinematics";

type RobotViewportProps = {
  frames: FrameState[];
  showAxes: boolean;
  showHousing: boolean;
};

const axisSwap = new THREE.Matrix4().set(
  1, 0, 0, 0,
  0, 0, 1, 0,
  0, 1, 0, 0,
  0, 0, 0, 1
);

function toThreeMatrix(elements: number[][]): THREE.Matrix4 {
  const matrix = new THREE.Matrix4();
  matrix.set(
    elements[0][0],
    elements[0][1],
    elements[0][2],
    elements[0][3],
    elements[1][0],
    elements[1][1],
    elements[1][2],
    elements[1][3],
    elements[2][0],
    elements[2][1],
    elements[2][2],
    elements[2][3],
    elements[3][0],
    elements[3][1],
    elements[3][2],
    elements[3][3]
  );
  return matrix;
}

function toDisplayMatrix(elements: number[][]): THREE.Matrix4 {
  const matrix = toThreeMatrix(elements);
  matrix.premultiply(axisSwap);
  return matrix;
}

function toDisplayPoint(origin: [number, number, number]): THREE.Vector3 {
  return new THREE.Vector3(origin[0], origin[2], origin[1]);
}

function createLabelSprite(text: string, color: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to create canvas context for axis label.");
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(255, 252, 245, 0.92)";
  context.beginPath();
  context.roundRect(8, 8, 112, 48, 18);
  context.fill();

  context.strokeStyle = color;
  context.lineWidth = 4;
  context.stroke();

  context.fillStyle = color;
  context.font = "bold 28px Segoe UI";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.08, 0.04, 1);
  return sprite;
}

function createAxisArrow(
  axis: "x" | "y" | "z",
  color: string,
  length: number
): THREE.Group {
  const group = new THREE.Group();
  const shaftLength = length * 0.72;
  const headLength = length * 0.28;
  const direction =
    axis === "x"
      ? new THREE.Vector3(1, 0, 0)
      : axis === "y"
        ? new THREE.Vector3(0, 1, 0)
        : new THREE.Vector3(0, 0, 1);
  const rotation = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction
  );

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0055, 0.0055, shaftLength, 16),
    new THREE.MeshStandardMaterial({
      color,
      metalness: 0.15,
      roughness: 0.35
    })
  );
  shaft.position.copy(direction.clone().multiplyScalar(shaftLength * 0.5));
  shaft.quaternion.copy(rotation);
  group.add(shaft);

  const head = new THREE.Mesh(
    new THREE.ConeGeometry(0.014, headLength, 18),
    new THREE.MeshStandardMaterial({
      color,
      metalness: 0.08,
      roughness: 0.28
    })
  );
  head.position.copy(
    direction.clone().multiplyScalar(shaftLength + headLength * 0.5)
  );
  head.quaternion.copy(rotation);
  group.add(head);

  const label = createLabelSprite(axis.toUpperCase(), color);
  label.position.copy(direction.clone().multiplyScalar(length + 0.03));
  group.add(label);

  return group;
}

function createFrameAxes(worldMatrix: THREE.Matrix4, scale: number): THREE.Group {
  const group = new THREE.Group();
  group.matrixAutoUpdate = false;
  group.matrix.copy(worldMatrix);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(scale * 0.16, 20, 20),
    new THREE.MeshStandardMaterial({
      color: "#fff7eb",
      emissive: "#efe0c2",
      metalness: 0.08,
      roughness: 0.22
    })
  );
  group.add(core);

  group.add(createAxisArrow("x", "#d84d4d", scale));
  group.add(createAxisArrow("y", "#34a853", scale));
  group.add(createAxisArrow("z", "#2a6fdb", scale));

  return group;
}

function createBasePedestal(origin: THREE.Vector3): THREE.Group {
  const group = new THREE.Group();
  group.position.copy(origin);

  const foot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.21, 0.06, 32),
    new THREE.MeshStandardMaterial({
      color: "#38414f",
      metalness: 0.42,
      roughness: 0.45
    })
  );
  foot.position.y = 0.03;
  group.add(foot);

  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.14, 0.16, 32),
    new THREE.MeshStandardMaterial({
      color: "#d7dde5",
      metalness: 0.32,
      roughness: 0.28
    })
  );
  tower.position.y = 0.14;
  group.add(tower);

  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.022, 32),
    new THREE.MeshStandardMaterial({
      color: "#c2783b",
      metalness: 0.2,
      roughness: 0.35
    })
  );
  collar.position.y = 0.23;
  group.add(collar);

  return group;
}

function createJointHousing(
  worldMatrix: THREE.Matrix4,
  index: number,
  isTool = false
): THREE.Group {
  const group = new THREE.Group();
  group.matrixAutoUpdate = false;
  group.matrix.copy(worldMatrix);

  const shellColor = isTool ? "#d17b43" : index % 2 === 0 ? "#d6dee7" : "#cfd6df";
  const accentColor = isTool ? "#834d24" : "#505a68";
  const bodyLength = isTool ? 0.055 : 0.08;
  const radius = isTool ? 0.022 : 0.03;

  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, bodyLength, 28),
    new THREE.MeshStandardMaterial({
      color: shellColor,
      metalness: 0.34,
      roughness: 0.28
    })
  );
  shell.rotation.x = Math.PI * 0.5;
  group.add(shell);

  const collarA = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.18, radius * 1.18, 0.012, 28),
    new THREE.MeshStandardMaterial({
      color: accentColor,
      metalness: 0.4,
      roughness: 0.34
    })
  );
  collarA.position.z = -bodyLength * 0.42;
  collarA.rotation.x = Math.PI * 0.5;
  group.add(collarA);

  const collarB = collarA.clone();
  collarB.position.z = bodyLength * 0.42;
  group.add(collarB);

  return group;
}

function createLinkSegment(
  start: THREE.Vector3,
  end: THREE.Vector3,
  index: number
): THREE.Group | null {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();

  if (length < 1e-4) {
    return null;
  }

  const group = new THREE.Group();
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  group.position.copy(midpoint);
  group.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );

  const mainRadius = Math.min(0.032, Math.max(0.02, length * 0.12));
  const shellColor = index % 2 === 0 ? "#eef2f7" : "#dfe5ec";
  const accentColor = index % 2 === 0 ? "#c67d44" : "#58718b";

  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(mainRadius, mainRadius, length * 0.88, 28),
    new THREE.MeshStandardMaterial({
      color: shellColor,
      metalness: 0.28,
      roughness: 0.24
    })
  );
  group.add(shell);

  const spine = new THREE.Mesh(
    new THREE.BoxGeometry(mainRadius * 1.45, length * 0.46, mainRadius * 1.15),
    new THREE.MeshStandardMaterial({
      color: accentColor,
      metalness: 0.12,
      roughness: 0.48
    })
  );
  spine.position.z = mainRadius * 0.42;
  group.add(spine);

  const rail = new THREE.Mesh(
    new THREE.CylinderGeometry(mainRadius * 0.34, mainRadius * 0.34, length * 0.94, 18),
    new THREE.MeshStandardMaterial({
      color: "#3f4754",
      metalness: 0.44,
      roughness: 0.34
    })
  );
  rail.position.x = mainRadius * 0.58;
  group.add(rail);

  return group;
}

function createTool(worldMatrix: THREE.Matrix4): THREE.Group {
  const group = new THREE.Group();
  group.matrixAutoUpdate = false;
  group.matrix.copy(worldMatrix);

  const wrist = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.08, 24),
    new THREE.MeshStandardMaterial({
      color: "#d4a05d",
      metalness: 0.28,
      roughness: 0.3
    })
  );
  wrist.rotation.x = Math.PI * 0.5;
  wrist.position.z = 0.045;
  group.add(wrist);

  const palm = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.025, 0.06),
    new THREE.MeshStandardMaterial({
      color: "#4e5b68",
      metalness: 0.18,
      roughness: 0.4
    })
  );
  palm.position.z = 0.095;
  group.add(palm);

  [-1, 1].forEach((sign) => {
    const finger = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.06, 0.012),
      new THREE.MeshStandardMaterial({
        color: "#e7ebef",
        metalness: 0.22,
        roughness: 0.28
      })
    );
    finger.position.set(sign * 0.018, -0.018, 0.13);
    group.add(finger);
  });

  return group;
}

function createSkeletonView(points: THREE.Vector3[]): THREE.Group {
  const group = new THREE.Group();

  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: "#234b5c" })
  );
  group.add(line);

  points.forEach((point, index) => {
    const jointSphere = new THREE.Mesh(
      new THREE.SphereGeometry(index === points.length - 1 ? 0.028 : 0.035, 24, 24),
      new THREE.MeshStandardMaterial({
        color: index === points.length - 1 ? "#d46a6a" : "#1f7a8c",
        roughness: 0.42,
        metalness: 0.12
      })
    );
    jointSphere.position.copy(point);
    group.add(jointSphere);
  });

  return group;
}

function disposeMaterial(material: THREE.Material) {
  const materialWithMaps = material as THREE.Material & {
    [key: string]: unknown;
  };

  Object.values(materialWithMaps).forEach((value) => {
    if (value instanceof THREE.Texture) {
      value.dispose();
    }
  });

  material.dispose();
}

export default function RobotViewport({
  frames,
  showAxes,
  showHousing
}: RobotViewportProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const robotGroupRef = useRef<THREE.Group | null>(null);

  const disposeGroup = (group: THREE.Group) => {
    group.traverse((child: THREE.Object3D) => {
      const objectWithGeometry = child as THREE.Object3D & {
        geometry?: THREE.BufferGeometry;
        material?: THREE.Material | THREE.Material[];
      };

      if (objectWithGeometry.geometry) {
        objectWithGeometry.geometry.dispose();
      }

      if (Array.isArray(objectWithGeometry.material)) {
        objectWithGeometry.material.forEach((material) => disposeMaterial(material));
      } else if (objectWithGeometry.material) {
        disposeMaterial(objectWithGeometry.material);
      }
    });

    group.clear();
  };

  useEffect(() => {
    if (!hostRef.current) {
      return undefined;
    }

    const host = hostRef.current;
    const width = host.clientWidth || 800;
    const height = host.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f4efe2");
    scene.fog = new THREE.Fog("#efe4cf", 2.8, 7.2);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 100);
    camera.position.set(1.8, 1.45, 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.55, 0);
    controls.minDistance = 0.8;
    controls.maxDistance = 6;

    scene.add(new THREE.AmbientLight("#ffffff", 1.7));

    const keyLight = new THREE.DirectionalLight("#fff2d7", 2.7);
    keyLight.position.set(3.2, 4.8, 2.4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight("#dbe8ff", 1.1);
    fillLight.position.set(-2.2, 2.4, -2.8);
    scene.add(fillLight);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(2.4, 48),
      new THREE.MeshStandardMaterial({
        color: "#efe2cc",
        metalness: 0,
        roughness: 0.95
      })
    );
    ground.rotation.x = -Math.PI * 0.5;
    ground.position.y = -0.001;
    scene.add(ground);

    const grid = new THREE.GridHelper(4, 20, "#7b5e57", "#ccb89e");
    scene.add(grid);

    const robotGroup = new THREE.Group();
    scene.add(robotGroup);
    robotGroupRef.current = robotGroup;

    let animationFrameId = 0;

    const handleResize = () => {
      if (!hostRef.current) {
        return;
      }

      const nextWidth = hostRef.current.clientWidth || 800;
      const nextHeight = hostRef.current.clientHeight || 600;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      animationFrameId = window.requestAnimationFrame(animate);
    };

    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
      robotGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const robotGroup = robotGroupRef.current;
    if (!robotGroup) {
      return;
    }

    disposeGroup(robotGroup);

    if (frames.length < 2) {
      return;
    }

    const displayFrames = frames.map((frame) => ({
      matrix: toDisplayMatrix(frame.transform),
      origin: toDisplayPoint(frame.origin)
    }));
    const points = displayFrames.map((frame) => frame.origin);

    if (showHousing) {
      robotGroup.add(createBasePedestal(displayFrames[0].origin));
    } else {
      robotGroup.add(createSkeletonView(points));
    }

    displayFrames.forEach((frame, index) => {
      const scale = index === 0 ? 0.16 : index === displayFrames.length - 1 ? 0.12 : 0.14;
      if (showAxes) {
        robotGroup.add(createFrameAxes(frame.matrix, scale));
      }
      if (showHousing) {
        robotGroup.add(
          createJointHousing(frame.matrix, index, index === displayFrames.length - 1)
        );
      }

      if (showHousing && index < displayFrames.length - 1) {
        const link = createLinkSegment(frame.origin, displayFrames[index + 1].origin, index);
        if (link) {
          robotGroup.add(link);
        }
      }
    });

    if (showHousing) {
      robotGroup.add(createTool(displayFrames[displayFrames.length - 1].matrix));
    }
  }, [frames, showAxes, showHousing]);

  return <div className="viewport" ref={hostRef} />;
}
