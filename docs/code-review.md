# Комплексное код-ревью Panelka (v0.0.72)

Три независимых прохода: (A) безопасность/корректность бэка, (B) фронт + embed + render-core,
(C) качество/OOP/правила §17. Ниже — сведённый список без дублей, по важности. В конце — что
сделано хорошо и рекомендованный порядок фиксов.

Общий вердикт: код дисциплинированный (чистая FSD-слоистость, провайдер-абстракции billing/OAuth,
UUID-ключи, строгая типизация, комментов нет, DOM рендерится через `textContent` — XSS-безопасно,
SSRF-пиннинг корректен, IDOR закрыт). Но есть **несколько критичных дыр в биллинге/секретах**, которые
надо закрыть до любого прод-запуска.

---

## 🔴 Critical — ✅ ИСПРАВЛЕНО (все 4)

1. **Само-повышение тарифа — полный обход оплаты.**
   `app/api/users.py` → `app/services/user.py`: `PATCH /api/v1/me/subscription {tier}` пишет тариф в
   `user.subscription_tier` без оплаты и проверок. Любой авторизованный ставит себе `unlimited`
   (∞ дашбордов, кастом-темы, снятие вотермарки, экспорт). На фронте это же дергается в
   `profile.vue` (`session.setTier`) как «dev-мок». Это боевая дыра.
   **Фикс:** убрать/закрыть эндпоинт; повышать тариф может только верифицированный вебхук. На фронте
   убрать fallback `setTier(paid)`.

2. **Дефолтный JWT-секрет `"change-me"` без прод-гарда.**
   `app/core/config.py` `jwt_secret="change-me"`. Если env не задан в проде — все токены подделываемы
   → полный захват аккаунтов.
   **Фикс:** падать на старте, если `environment=="production"` и секрет дефолтный/слабый.

3. **Пустой секрет CloudPayments → подделываемые вебхуки.**
   `cloudpayments_api_secret=""` по умолчанию; HMAC считается с пустым ключом. Любой может собрать
   «валидную» подпись и POST-ом активировать любой тариф на любой аккаунт.
   **Фикс:** отклонять вебхуки / не стартовать в проде при пустом секрете.

4. **Тариф из вебхука не привязан к оплаченной сумме (trust boundary).**
   `cloudpayments.py` берёт `tier` из клиентских `Data/Metadata`; `billing/service.py` активирует его,
   не сверяя с `PLAN_PRICES`. Даже с валидной подписью можно оплатить `pro` (490₽), а в metadata
   передать `unlimited`.
   **Фикс:** выводить тариф из оплаченной суммы / серверного инвойса, а не из клиентских метаданных.

---

## 🟠 High — ✅ все исправлено (5, 6, 7, 8, 9, 10, 11)

5. **Доменный allowlist embed не проверяется на сервере.**
   `app/api/public.py`: `get_embed_config`, `embed_pull_data`, WS `embed_live` отдают всё любому с
   токеном; `allowed_domains` хранится и возвращается, но Origin/Referer нигде не сверяется (только
   iframe-страница ставит `frame-ancestors` на SSR). Для Web-Component/NPM-пути (просто `fetch`)
   allowlist декоративен.
   **Фикс:** проверять Origin/Referer против `allowed_domains` в config/pull/WS.

6. ✅ **ИСПРАВЛЕНО. Неполная детекция повторного использования refresh-токена.**
   `app/services/auth.py`: ротация ревокает предъявленный токен и отклоняет уже ревокнутый, но не
   инвалидирует всю «семью» токенов пользователя при обнаружении reuse. Украденный refresh продолжает
   работать до следующей ротации жертвы.
   **Фикс:** при встрече ревокнутого токена `rotate()` вызывает `_revoke_family(user_id)` — ревокает
   все non-revoked refresh-токены пользователя; refresh-роут коммитит на error-пути, чтобы ревокация
   сохранилась. Тест: после reuse старого токена текущая кука тоже мертва (401).

7. ✅ **ИСПРАВЛЕНО. SSRF/URL-pull: лимит размера неэффективен (нет стриминга).**
   `app/core/ssrf.py` (`response.content`) и клиентский `embed/src/data/url-pull.ts`
   (`response.text()`, длина в UTF-16, не в байтах) буферизуют весь ответ до проверки размера →
   память можно исчерпать в пределах таймаута.
   **Фикс:** сервер стримит через `client.stream` — проверка `Content-Length`, накопление по
   `aiter_bytes()` с обрывом при превышении `max_bytes`. Клиент читает `response.body.getReader()`,
   считает байты (`byteLength`), отменяет ридер при превышении; парсит через `TextDecoder`.

8. **Rate-limit схлопывается за реверс-прокси.**
   `app/core/rate_limit.py` ключ по `request.client.host`; за Nginx/Traefik все клиенты = IP прокси →
   один общий бакет, брутфорс-лимиты не работают. (Плюс: XFF не читается, значит ключ не подделать.)
   **Фикс:** настроить доверенный прокси и брать реальный клиентский IP из доверенного заголовка.

9. **401-ретрай не повторяет POST/PATCH.**
   `frontend/src/shared/api/index.ts`: после успешного refresh реплеятся только GET/DELETE; мутации
   (updateName, changePassword, setTier, publish, duplicate) молча падают при истечении токена.
   Редактор костыляет это ручным ре-PATCH.
   **Фикс:** централизованно повторять и мутации (тело доступно — клонировать и повторить со свежим
   токеном).

10. ✅ **ИСПРАВЛЕНО. Дублирование (DRY):**
    - CSS DOM-виджетов вынесен в `packages/renderer/src/styles.ts` (`WIDGET_CSS`); embed-шелл собирает
      `ENGINE_CSS = SHELL + WIDGET_CSS`, фронт инжектит `WIDGET_CSS` клиентским плагином
      `widget-css.client.ts` (удалён дубликат из `theme.css`). Один источник.
    - `DashboardEngine` перенесён в `packages/renderer/src/engine.ts` (общий рантайм); embed
      реэкспортит его, iframe-страница `pages/embed/[token].vue` теперь гоняется через тот же движок
      (сетка/тема/атрибуция/merge/resize больше не дублируются).

11. ✅ **ИСПРАВЛЕНО. embed без тестов (§17.5).** Добавлены smoke-тесты (9 шт.): `DashboardEngine`
    (mount → сетка/атрибуция/секция, `setData` → рендер данных, `destroy`) через компактный DOM-стаб;
    `UrlPuller` (парсинг + оба лимита размера — content-length и стриминговый обрыв); `LiveConnection`
    (панелка-фреймы/мусор/close). Идут в node-окружении без jsdom (в песочнице недоступен).

---

## 🟡 Medium — ✅ все исправлено (12–21)

12. ✅ **ИСПРАВЛЕНО. postMessage в embed без проверки origin/source** (`pages/embed/[token].vue`):
    `onMessage` теперь принимает кадры только если `event.source === window.parent` и `event.origin`
    входит в `allowed_domains` (пустой allowlist → любой, как и `frame-ancestors *`).

13. ⚠️ **ПЕРЕСМОТРЕНО (надёжность > хардненинг).** memory-only access-токен ломал переживание
    reload в кросс-origin дев-сетапе (:3000↔:8000), где SameSite=Lax refresh-cookie нестабилен.
    Вернул `panelka_access` cookie (SameSite=Lax): `init()` сперва валидирует его через `/me`, и только
    при неудаче идёт в refresh. Плюс refresh сделан **неротирующим** (тот же токен валиден весь TTL —
    нет гонок ротации). Компромисс по XSS осознанный; долгосрочно правильнее same-origin API-прокси в
    dev, тогда можно вернуть memory-only.

14. ✅ **ИСПРАВЛЕНО. WS-токен в query-строке** (`store.ts`, `app/api/ws.py`): session-сокет больше не
    передаёт JWT в URL — токен уходит в `Sec-WebSocket-Protocol` (второй аргумент `WebSocket`), сервер
    достаёт его из заголовка и подтверждает подпротокол `panelka-ws`. В URL/логах токена нет.

15. ✅ **ИСПРАВЛЕНО. iframe-страница игнорирует кастомные темы** (`pages/embed/[token].vue`): страница
    теперь рендерится через `DashboardEngine`, который применяет `resolveTheme(theme_key, theme_tokens)`
    — кастомные темы работают в iframe так же, как в SDK.

16. ✅ **ИСПРАВЛЕНО. `GET /billing/status`** (`app/api/billing.py`): теперь читает `Subscription` через
    `BillingService.status_for(user)` — возвращает реальный `status` (или `inactive`, если подписки нет).

17. ✅ **ИСПРАВЛЕНО. `AnalyticsService.record_load` коммитил в сервисе**: заменён на `flush`; commit
    (и rollback при ошибке) вынесен в `public._record_load` — конвенция «flush в сервисе, commit в
    роутере» соблюдена.

18. ✅ **ИСПРАВЛЕНО. OAuth callback отдавал JSON** (`app/api/oauth.py`): callback ставит httpOnly
    refresh-cookie и делает 303-редирект на `frontend_url/dashboards`; фронт восстанавливает сессию через
    `refresh`. На странице логина добавлены кнопки Yandex/VK (`/auth/oauth/{provider}/start`).

19. ✅ **ИСПРАВЛЕНО. `contract` — источник правды**: `packages/contract` приведён к реальному
    wire-формату (snake_case + `theme_tokens`/`allowed_domains`); ARCHITECTURE уточнён: contract хранит
    доменные shape'ы, `packages/renderer` — единый рантайм (`EmbedConfig`/`DashboardEngine`),
    реэкспортируемый embed'ом.

20. ✅ **ИСПРАВЛЕНО. Пробелы в тестах**: добавлен dispatch-тест `renderWidget` по всем DOM-типам
    (stat-tile/section/ranking/table/text/progress) в `engine.test.ts`; backend-тесты вебхуков
    `Cancelled→downgrade→free` и `Declined→past_due`.

21. ✅ **ИСПРАВЛЕНО. `DashboardUpdate.status` + безлимитные dict'ы**: поле `status` убрано из
    `DashboardUpdate` (сменить статус можно только через publish-флоу); на `layout/data_bindings/
    data_source/theme_tokens` навешен валидатор размера (`MAX_JSON_BYTES = 256 KiB`).

---

## 🟢 Low — ✅ все исправлено (22–31)

22. ✅ Rate-limiter fail-open теперь управляется настройкой `rate_limit_fail_open` (по умолчанию `True`).
23. ✅ `uuid.UUID(sub)`/`payload["sub"]` обёрнуты — при кривом токене 401, не 500 (`api/deps.py`, `api/ws.py`).
24. ✅ Публичный конфиг: кэш `embed:{token}` инвалидируется при publish/republish (`api/dashboards.py`).
25. ✅ `/auth/oauth/*` получил rate-limit (тот же бакет-лимит, что и `/auth`).
26. ✅ CSP `connect-src` сужен до `'self' <api-origin> <ws-origin>` (без `http:`/широких схем).
27. ✅ `reportHeight` шлёт высоту в origin родителя (из `document.referrer`), не в `*`.
28. ✅ Кэш GeoJSON ограничен (LRU-вытеснение, `MAX_CACHE_ENTRIES`); фетч карты стримится с байт-лимитом `MAX_GEOJSON_BYTES`.
29. ✅ `WidgetView` пересоздаёт рендерер при смене `type` виджета (dispose + новый `renderWidget`).
30. ✅ `ConfigPanel.vue` (~570 строк) разбит: вся логика вынесена в composable
    `model/useWidgetConfig.ts`, per-type секции — в под-компоненты (`GeneralFields`, `KpiFields`,
    `CartesianFields`, `RankingFields`, `TableFields`, `MapFields`, `SchemaFields`); сам `ConfigPanel`
    стал тонким диспетчером (~30 строк). Проверено `vue-tsc` (чисто).
31. ✅ Формулировка «signed» токена в CLAUDE.md заменена на «opaque, random, revocable».

---

## 🔵 Найдено в ходе фикса

32. **Фронт-vitest не парсит `.vue`** (`frontend/vitest.config.ts`): нет vue-плагина и FSD-alias'ов, поэтому
    `canvas/store.test.ts` (тянет barrel `@entities/widget` c `.vue`) падает на старте. Не связано с
    правками ревью. Полноценный фикс требует добавить `@vitejs/plugin-vue` в devDeps фронта + alias'ы в
    конфиг (в песочнице заблокировано `--frozen-lockfile`/отсутствием сети). Alias'ы можно добавить
    сразу; vue-плагин — отдельным PR с обновлением lockfile.

---

## ✅ Что сделано хорошо (проверено, не является проблемой)
- **SSRF-пиннинг корректен**: один резолв → пуск на провалидированный публичный IP с сохранением
  Host/SNI, без TOCTOU; блок private/loopback/link-local/reserved (в т.ч. IPv6), редиректы выключены.
- **IDOR закрыт**: `get_owned` сверяет `user_id` и кидает 404; все dashboard/export-роуты через него.
- **XSS-безопасно**: все DOM-рендереры на `textContent`/`.title`, нигде нет `innerHTML`/`v-html`.
- Argon2, refresh-токены хранятся как SHA-256, change-password ревокает все refresh.
- OAuth-state CSRF через httpOnly-cookie + `compare_digest`; сравнения подписей/ключей timing-safe.
- ORM везде (без строкового SQL); refresh-cookie httpOnly+Secure(prod)+SameSite=Lax+path; docs
  закрыты в проде; CORS не `*`.
- FSD-слоистость чистая, комментов нет (§17.7), провайдер-абстракции billing/OAuth на `Protocol`.
- Покрытие тестами auth/quota/publish/analytics/webhook-idempotency/подпись/security-headers/CORS —
  хорошее.

---

## Рекомендованный порядок фиксов
1. ✅ **Critical 1–4** (биллинг/секреты) — до любого прод-деплоя.
2. ✅ **High 5, 8, 9** (allowlist-enforcement, proxy-IP для rate-limit, 401-ретрай мутаций).
3. ✅ **High 6, 7** (refresh-family invalidation, стриминговый лимит pull).
4. **High 10–11** (дедуп CSS + iframe-движок, тесты embed) — качество/поддерживаемость.
5. Medium/Low — по мере готовности.
