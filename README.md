# vibecoding

새 프로젝트를 시작하기 위한 기본 저장소입니다.

## 시작 상태

- Git 저장소 초기화 완료
- GitHub 업로드용 기본 설정 추가
- 공통 개발 설정 파일 추가
- 기본 폴더 구조 생성

## 폴더 구조

```text
.
|-- docs/
|-- src/
|-- tests/
|-- .editorconfig
|-- .env.example
|-- .gitattributes
|-- .gitignore
`-- README.md
```

## 추천 작업 순서

1. 프로젝트 종류를 정합니다. 예: Node.js, Python, React, FastAPI
2. 필요한 런타임과 패키지 매니저를 설치합니다.
3. `src/` 아래에서 실제 구현을 시작합니다.
4. 테스트는 `tests/`에 추가합니다.
5. 민감한 값은 `.env`에 넣고, 공유 가능한 예시는 `.env.example`에 남깁니다.

## GitHub 업로드 예시

```bash
git add .
git commit -m "chore: initialize project"
git remote add origin <your-github-repo-url>
git push -u origin main
```

## 메모

프로젝트 스택이 정해지면 여기에 실행 방법과 개발 명령어를 추가하면 됩니다.
