# 현대차 소셜 로그인 중복 실행 여부 점검 결과

백엔드에서 의심한 6가지 패턴(팝업/탭, `<a>` + `onClick` 중복, Axios/fetch 선호출, `useEffect` 재실행, 다중 탭/창, 콜백 URL 새로고침)을 프론트 코드 전체에서 확인한 결과입니다.

## 1. `window.open()`과 `window.location`을 같이 쓰는지

아니요. `window.open`은 코드 전체에 단 한 번도 쓰이지 않습니다. 소셜 로그인은 `socialLogin.ts`의 `window.location.assign()` 한 줄이 전부입니다.

## 2. `<a href>`와 `onClick`이 동시에 이동시키는지

아니요. 현대/카카오 로그인은 `<a>`가 아니라 `<button type="button" onClick={...}>`입니다. `href`가 없으니 이중 이동 자체가 구조적으로 불가능합니다.

(참고: 프로젝트 안에 `<a>` + `target="_blank"`가 하나 있긴 하지만, 마이페이지의 "버그 제보" 피드백 폼 링크라 로그인과 무관합니다.)

## 3. Axios/fetch로 로그인 주소를 먼저 호출하는지

아니요. 프로젝트 전체에 axios interceptor가 없고(순수 `fetch` 기반), `/oauth2/authorization/`를 fetch나 axios로 호출하는 코드는 없습니다. 이 경로를 참조하는 곳은 `socialLogin.ts`의 `window.location.assign()` 한 곳뿐입니다. 네트워크 탭에서도 이 요청의 Type이 `xhr`/`fetch`가 아니라 `document`(실제 페이지 이동)로 찍혔던 것이 이를 뒷받침합니다.

## 4. `useEffect`에서 현대 로그인을 다시 실행하는지

아니요. `useEffect`가 있는 곳은 `useSocialLoginCallback`, `useSessionBootstrap` 두 군데뿐이며, 둘 다 "로그인 성공 후 돌아왔을 때 토큰을 갱신하는" 용도입니다. `redirectToSocialLogin`을 호출하는 코드는 전혀 없습니다.

## 5. 로그인 창/탭이 두 개 열리는지

팝업/새 탭을 여는 코드가 없으니 구조적으로 불가능합니다. 네트워크 탭에서도 `/oauth2/authorization/hyundai`가 정확히 한 번(Initiator: 프론트 번들 `content-main.js:9`)만 찍힌 것으로 이미 확인했습니다.

## 6. 실패한 콜백 URL을 새로고침하는지

`location.reload()` 호출이 프로젝트 전체에 단 한 군데도 없습니다. TanStack Query 쪽 관련 훅들도 전부 `retry: false`라 자동 재시도가 없습니다.

## 현재 로그인 버튼 코드

```ts
// socialLogin.ts
export function redirectToSocialLogin(provider: SocialLoginProvider) {
    window.location.assign(`${env.apiBaseUrl}/oauth2/authorization/${provider}`)
}
```

```tsx
// LoginPrompt.tsx
const handleSocialLogin = (provider: SocialLoginProvider) => {
    if (isRedirecting) return
    setIsRedirecting(true)
    redirectToSocialLogin(provider)
}
```

## 결론

프론트 쪽에서 이중 실행을 일으킬 만한 코드 경로 자체가 없습니다. 또한 콜백 요청(`hyundai?code=...`)이 `Type: document`, `401` JSON 응답으로 떨어진다는 것은 SPA JS가 로드되기도 전에 서버(Spring Security)에서 이미 실패 처리가 끝났다는 뜻이라, 이 시점엔 브라우저 탭에서 우리 프론트 코드가 아직 실행조차 안 된 상태입니다. 즉 "다른 탭/팝업에서 콜백을 먼저 처리한다"는 시나리오도, 애초에 그런 팝업/탭을 여는 코드 자체가 없어 성립하기 어렵습니다.

재현 시 브라우저 탭이 실제로 몇 개 열리는지 육안으로 직접 확인해보는 것도 참고할 만합니다.
