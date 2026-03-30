import { useState } from "react";
import RobotViewport from "./components/RobotViewport";
import { solveForwardKinematics } from "./kinematics";
import { defaultJointAnglesDeg, defaultRobot } from "./model";

const presetPoses = [
  {
    name: "Home",
    description: "좌표계와 frame 설명에 적합한 기본 자세입니다.",
    values: [0, -90, 90, 0, 45, 0]
  },
  {
    name: "Reach",
    description: "workspace를 설명하기 좋은 전방 자세입니다.",
    values: [30, -70, 60, -20, 55, 10]
  },
  {
    name: "Pick",
    description: "pick-and-place 흐름을 보여주기 좋은 자세입니다.",
    values: [-45, -110, 100, 25, 70, 30]
  },
  {
    name: "Fold",
    description: "joint coupling을 보기 좋은 접힘 자세입니다.",
    values: [90, -135, 120, -60, 35, 90]
  }
];

function formatNumber(value: number): string {
  return value.toFixed(3);
}

export default function App() {
  const [jointAnglesDeg, setJointAnglesDeg] = useState(defaultJointAnglesDeg);
  const [robot, setRobot] = useState(defaultRobot);
  const [showAxes, setShowAxes] = useState(true);
  const [showHousing, setShowHousing] = useState(true);

  const kinematics = solveForwardKinematics(robot, jointAnglesDeg);
  const transformRows = kinematics.matrix.map((row) =>
    row.map((value) => formatNumber(value)).join("  ")
  );
  const reachDistance = Math.sqrt(
    kinematics.pose.x * kinematics.pose.x +
      kinematics.pose.y * kinematics.pose.y +
      kinematics.pose.z * kinematics.pose.z
  );

  const updateJointAngle = (index: number, value: number) => {
    setJointAnglesDeg((previous) =>
      previous.map((angle, itemIndex) => (itemIndex === index ? value : angle))
    );
  };

  const updateRobotValue = (
    index: number,
    key: "a" | "alphaDeg" | "d" | "thetaOffsetDeg",
    value: number
  ) => {
    setRobot((previous) =>
      previous.map((joint, itemIndex) =>
        itemIndex === index ? { ...joint, [key]: value } : joint
      )
    );
  };

  const resetPose = () => {
    setJointAnglesDeg(defaultJointAnglesDeg);
    setRobot(defaultRobot);
  };

  const applyPreset = (values: number[]) => {
    setJointAnglesDeg(values);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="hero-card">
          <p className="eyebrow">Windows 기반 로봇 교육 도구</p>
          <h1>KineLab</h1>
          <p className="hero-copy">
            DH parameter, frame transform, Forward Kinematics를 가르치기 위한
            교육용 시뮬레이터 초안입니다.
          </p>
          <button className="reset-button" onClick={resetPose} type="button">
            데모 로봇 초기화
          </button>
        </div>

        <section className="panel">
          <div className="panel-header">
            <h2>Viewport Options</h2>
            <span>표시 설정</span>
          </div>

          <div className="toggle-list">
            <label className="toggle-row">
              <div>
                <strong>Axes</strong>
                <span>local frame의 X/Y/Z 축을 표시합니다.</span>
              </div>
              <input
                checked={showAxes}
                onChange={(event) => setShowAxes(event.target.checked)}
                type="checkbox"
              />
            </label>

            <label className="toggle-row">
              <div>
                <strong>Housing</strong>
                <span>로봇 하우징과 링크 visual을 표시합니다.</span>
              </div>
              <input
                checked={showHousing}
                onChange={(event) => setShowHousing(event.target.checked)}
                type="checkbox"
              />
            </label>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Preset Poses</h2>
            <span>빠른 데모</span>
          </div>

          <div className="preset-list">
            {presetPoses.map((preset) => (
              <button
                className="preset-card"
                key={preset.name}
                onClick={() => applyPreset(preset.values)}
                type="button"
              >
                <strong>{preset.name}</strong>
                <span>{preset.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Joint Control</h2>
            <span>6-DOF</span>
          </div>

          {robot.map((joint, index) => (
            <label className="slider-row" key={joint.id}>
              <div className="slider-head">
                <span>{`Joint ${index + 1}`}</span>
                <strong>{jointAnglesDeg[index].toFixed(1)} deg</strong>
              </div>
              <input
                max={joint.maxDeg}
                min={joint.minDeg}
                onChange={(event) =>
                  updateJointAngle(index, Number(event.target.value))
                }
                type="range"
                value={jointAnglesDeg[index]}
              />
            </label>
          ))}
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>End-Effector</h2>
            <span>Forward Kinematics</span>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span>X</span>
              <strong>{formatNumber(kinematics.pose.x)} m</strong>
            </div>
            <div className="stat-card">
              <span>Y</span>
              <strong>{formatNumber(kinematics.pose.y)} m</strong>
            </div>
            <div className="stat-card">
              <span>Z</span>
              <strong>{formatNumber(kinematics.pose.z)} m</strong>
            </div>
            <div className="stat-card">
              <span>Roll</span>
              <strong>{formatNumber(kinematics.pose.rollDeg)} deg</strong>
            </div>
            <div className="stat-card">
              <span>Pitch</span>
              <strong>{formatNumber(kinematics.pose.pitchDeg)} deg</strong>
            </div>
            <div className="stat-card">
              <span>Yaw</span>
              <strong>{formatNumber(kinematics.pose.yawDeg)} deg</strong>
            </div>
            <div className="stat-card">
              <span>Reach</span>
              <strong>{formatNumber(reachDistance)} m</strong>
            </div>
            <div className="stat-card">
              <span>Frames</span>
              <strong>{kinematics.frames.length}</strong>
            </div>
          </div>
        </section>
      </aside>

      <main className="main-stage">
        <section className="viewport-card">
          <div className="viewport-copy">
            <div>
              <p className="eyebrow">시뮬레이터 초안</p>
              <h2>3D Manipulator View</h2>
            </div>
            <p>
              마우스로 드래그하면 카메라를 회전할 수 있습니다. 색상 축은 base
              frame과 각 joint frame을 보여줍니다.
            </p>
          </div>
          <div className="axis-legend">
            <span className="axis-chip axis-chip-x">X축 = 빨강</span>
            <span className="axis-chip axis-chip-y">Y축 = 초록</span>
            <span className="axis-chip axis-chip-z">Z축 = 파랑</span>
          </div>
          <RobotViewport
            frames={kinematics.frames}
            showAxes={showAxes}
            showHousing={showHousing}
          />
        </section>

        <section className="table-card">
          <div className="panel-header">
            <h2>DH Parameter Editor</h2>
            <span>m / deg</span>
          </div>

          <p className="helper-copy">
            `a`는 link length, `alpha`는 twist angle, `d`는 offset, `theta
            offset`은 joint zero 보정값입니다.
          </p>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Joint</th>
                  <th>a</th>
                  <th>alpha</th>
                  <th>d</th>
                  <th>theta offset</th>
                </tr>
              </thead>
              <tbody>
                {robot.map((joint, index) => (
                  <tr key={joint.id}>
                    <td>{`Joint ${index + 1}`}</td>
                    <td>
                      <input
                        onChange={(event) =>
                          updateRobotValue(index, "a", Number(event.target.value))
                        }
                        step="0.01"
                        type="number"
                        value={joint.a}
                      />
                    </td>
                    <td>
                      <input
                        onChange={(event) =>
                          updateRobotValue(
                            index,
                            "alphaDeg",
                            Number(event.target.value)
                          )
                        }
                        step="1"
                        type="number"
                        value={joint.alphaDeg}
                      />
                    </td>
                    <td>
                      <input
                        onChange={(event) =>
                          updateRobotValue(index, "d", Number(event.target.value))
                        }
                        step="0.01"
                        type="number"
                        value={joint.d}
                      />
                    </td>
                    <td>
                      <input
                        onChange={(event) =>
                          updateRobotValue(
                            index,
                            "thetaOffsetDeg",
                            Number(event.target.value)
                          )
                        }
                        step="1"
                        type="number"
                        value={joint.thetaOffsetDeg}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="table-card">
          <div className="panel-header">
            <h2>Transform Matrix</h2>
            <span>T06</span>
          </div>

          <pre className="matrix-block">{transformRows.join("\n")}</pre>
        </section>

        <section className="table-card note-grid">
          <div className="note-card">
            <p className="eyebrow">학습 포인트</p>
            <h3>DH 직관 이해</h3>
            <p>
              `a`, `alpha`, `d`, `theta offset` 값을 바꾸면 각 local frame이 전체
              link chain에 어떤 영향을 주는지 바로 볼 수 있습니다.
            </p>
          </div>
          <div className="note-card">
            <p className="eyebrow">검토 방법</p>
            <h3>무엇을 보면 되는지</h3>
            <p>
              slider를 움직이거나 preset pose를 바꾼 뒤, DH table 한 줄을 수정해서
              3D 구조와 End-Effector pose가 함께 바뀌는지 확인해 보세요.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
