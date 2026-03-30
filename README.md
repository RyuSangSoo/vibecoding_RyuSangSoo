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

## 제출용 실행 정보

### 실행 환경

- 운영체제: Windows 10 / Windows 11 64-bit
- 검증 환경: Windows 10 Pro
- 배포 형식: Electron 기반 Windows 실행 파일
- 권장 메모리: 4GB 이상
- 추가 런타임: exe 실행 시 별도 설치 불필요

### 설치 절차

#### 1. exe 실행만 필요한 경우

- 별도 종속 패키지 설치가 필요하지 않습니다.
- 아래 파일 중 하나를 실행하면 됩니다.
  - `KineLab-Portable-0.1.0.exe`
  - `KineLab-Setup-0.1.0.exe`

#### 2. 소스코드 실행/수정이 필요한 경우

```powershell
npm install
```

### 실행 방법

#### Portable 버전 실행

1. `release/KineLab-Portable-0.1.0.exe` 파일을 준비합니다.
2. 파일을 원하는 폴더에 둡니다.
3. 더블클릭하여 실행합니다.

#### Setup 버전 실행

1. `release/KineLab-Setup-0.1.0.exe` 파일을 실행합니다.
2. 설치 마법사에 따라 설치 경로를 선택합니다.
3. 설치 완료 후 바탕화면 또는 시작 메뉴에서 실행합니다.

#### 소스코드로 실행

1. 저장소 루트로 이동합니다.
2. 아래 명령을 실행합니다.

```powershell
npm run dev
```

3. 브라우저에서 `http://127.0.0.1:5173`에 접속합니다.

### 관리자 권한 필요 여부

- Portable 버전: 관리자 권한 불필요
- Setup 버전: 일반적으로 관리자 권한 불필요
- 단, Windows SmartScreen 경고가 표시될 수 있으며 이 경우 `추가 정보` -> `실행`을 눌러야 할 수 있습니다.

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

## Windows exe 배포

Electron 기반 Windows 배포 파일을 만들 수 있습니다.

배포 파일 생성:

```powershell
npm run dist:win
```

또는:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dist-win.ps1
```

생성 위치:

```text
release/KineLab-Portable-0.1.0.exe
release/KineLab-Setup-0.1.0.exe
```

참고:

- `KineLab-Portable-0.1.0.exe`
  설치 없이 바로 실행하는 portable 버전입니다.
- `KineLab-Setup-0.1.0.exe`
  설치 마법사를 통해 설치하는 setup 버전입니다.
- 커스텀 아이콘이 포함되어 있습니다.
- `release/` 폴더는 Git에 포함되지 않도록 `.gitignore`에 제외되어 있습니다.

## 프로젝트 구조

```text
.
|-- docs/
|   |-- project-plan.md
|   `-- work-plan.md
|-- scripts/
|   |-- build.ps1
|   |-- dev.ps1
|   |-- dist-win.ps1
|   `-- test.ps1
|-- electron/
|   |-- main.cjs
|   `-- preload.cjs
|-- assets/
|   `-- desktop/
|       |-- icon.ico
|       `-- icon.png
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
- 고급 물리 시뮬레이션
- 커스텀 앱 아이콘 및 서명

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
