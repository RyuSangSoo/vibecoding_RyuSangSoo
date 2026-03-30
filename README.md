# KineLab

KineLab은 Windows 환경에서 실행되는 교육용 6축 매니퓰레이터 시뮬레이터 1차 초안입니다.  
DH Parameter, local frame, Forward Kinematics를 직관적으로 학습할 수 있도록 만드는 것을 목표로 합니다.

## 프로젝트 소개

로봇공학 수업에서는 DH 파라미터, 좌표계 변환, 정기구학 개념이 매우 중요하지만, 수식만으로는 구조를 이해하기 어려운 경우가 많습니다.

이 프로젝트는 그런 학습 과정을 돕기 위해 다음과 같은 방향으로 설계되었습니다.

- Windows에서 바로 실행 가능한 교육용 시뮬레이터
- 6축 매니퓰레이터 기반 3D 시각화
- DH Parameter 수정에 따른 구조 변화 실시간 반영
- Joint Control과 End-Effector pose를 함께 확인 가능한 UI
- local frame 축 시각화와 skeleton / housing view 전환 지원

## 현재 구현된 기능

- 6축 매니퓰레이터 3D 뷰
- Joint 슬라이더 제어
- `DH Parameter Editor`
- `Transform Matrix (T06)` 표시
- `End-Effector` 위치 및 자세 표시
- preset pose 적용
- `Axes` / `Housing` 토글
- housing off 시 skeleton view 표시
- axis legend 표시
- Forward Kinematics 자동 테스트

## 기술 스택

- TypeScript
- React
- Three.js
- Vite
- Vitest

## 실행 방법

### 1. Node.js 준비

이 저장소는 Node.js `24.14.1` 환경에서 검증했습니다.  
`.nvmrc`를 포함해두었으므로 동일 버전 사용을 권장합니다.

### 2. 의존성 설치

```powershell
npm install
```

### 3. 개발 서버 실행

```powershell
npm run dev
```

브라우저에서 아래 주소로 접속합니다.

```text
http://127.0.0.1:5173
```

### 4. PowerShell 스크립트로 실행

현재 환경처럼 로컬 스크립트로 실행하려면 아래 명령도 사용할 수 있습니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1
```

## 테스트

자동 테스트 실행:

```powershell
npm run test
```

또는:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\test.ps1
```

현재 테스트는 아래 항목을 검증합니다.

- degree / radian 변환
- DH transform 계산
- theta offset 반영
- Forward Kinematics 기본 위치 계산

## 빌드

```powershell
npm run build
```

또는:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build.ps1
```

## 프로젝트 구조

```text
.
|-- docs/
|   |-- project-plan.md
|   `-- work-plan.md
|-- scripts/
|   |-- build.ps1
|   |-- dev.ps1
|   `-- test.ps1
|-- src/
|   |-- components/
|   |   `-- RobotViewport.tsx
|   |-- App.tsx
|   |-- kinematics.ts
|   |-- main.tsx
|   |-- model.ts
|   `-- styles.css
|-- tests/
|   `-- kinematics.test.ts
|-- index.html
|-- package.json
|-- tsconfig.json
`-- vite.config.ts
```

## 문서

- 기획서: [`docs/project-plan.md`](docs/project-plan.md)
- 작업계획서: [`docs/work-plan.md`](docs/work-plan.md)

## 현재 상태

이 버전은 1차 MVP 초안입니다.

아직 포함되지 않은 항목:

- Inverse Kinematics
- singularity / joint limit 분석
- 과제 모드
- Windows exe 패키징
- 고급 물리 시뮬레이션

## 다음 단계 아이디어

- IK 기능 추가
- frame / grid / label 세부 토글 추가
- 수업용 preset 시나리오 강화
- 과제 모드 및 저장 기능 추가
- Electron 또는 Tauri 기반 Windows 앱 패키징

## 업로드 전 체크

현재 업로드 전 확인 포인트는 아래와 같습니다.

- `npm run test` 통과
- `npm run build` 통과
- `node_modules`, `dist`, `.tools`는 `.gitignore`로 제외
- 문서와 실행 방법 포함

## 추천 커밋 메시지

```text
feat: add first kinelab simulator draft
```
