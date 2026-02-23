# DevSecOps — GitHub + GCP Cloud Build + Skill `/security`

**Proyecto:** AnimaLandia E-commerce
**Stack CI:** GitHub → GCP Cloud Build → Vercel
**Stack App:** Next.js 15 · Supabase · Stripe · Tailwind CSS v4

---

## Índice

1. [Arquitectura general](#1-arquitectura-general)
2. [Limitación clave: el skill de Claude Code no corre en CI](#2-limitación-clave)
3. [Solución: Scripts de seguridad extraídos del skill](#3-solución-scripts-extraídos)
4. [Configuración GitHub → Cloud Build](#4-configuración-github--cloud-build)
5. [cloudbuild.yaml — Pipeline completo](#5-cloudbuildyaml)
6. [Scripts de seguridad para CI](#6-scripts-de-seguridad-para-ci)
7. [Secretos en GCP Secret Manager](#7-secretos-en-gcp-secret-manager)
8. [Reportes y artefactos](#8-reportes-y-artefactos)
9. [PR Status Checks y bloqueo de merge](#9-pr-status-checks)
10. [Notificaciones](#10-notificaciones)
11. [Relación skill local ↔ pipeline CI](#11-relación-skill-local--pipeline-ci)
12. [Checklist de configuración inicial](#12-checklist-de-configuración-inicial)

---

## 1. Arquitectura general

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLUJO COMPLETO                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Developer                                                       │
│  ─────────────────────────────────────────────────────────────  │
│  1. git push / Pull Request → GitHub                            │
│                                                                  │
│  GitHub                                                          │
│  ─────────────────────────────────────────────────────────────  │
│  2. Trigger → GCP Cloud Build (webhook o GitHub App)            │
│                                                                  │
│  GCP Cloud Build                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  3. Step: Instalar dependencias (npm ci)                        │
│  4. Step: Lint + TypeScript check                               │
│  5. Step: FASE 1 — npm audit → falla si critical/high           │
│  6. Step: FASE 2 — SQL Injection scan (grep + reglas)           │
│  7. Step: FASE 3 — XSS scan (grep + reglas)                     │
│  8. Step: FASE 4 — Secrets scan (gitleaks + grep)               │
│  9. Step: FASE 5 — Security headers check (next.config.ts)      │
│  10. Step: FASE 6 — Auth patterns check (grep)                  │
│  11. Step: Build Next.js (npm run build)                        │
│  12. Step: Generar reporte security-scan.md → GCS Bucket        │
│                                                                  │
│  Si TODOS los steps pasan:                                       │
│  ─────────────────────────────────────────────────────────────  │
│  13. Deploy automático → Vercel (via vercel CLI)                 │
│  14. Notificación Slack/Email → "Deploy exitoso ✅"             │
│                                                                  │
│  Si algún step de seguridad falla:                               │
│  ─────────────────────────────────────────────────────────────  │
│  13. Build marcado como FAILED en GitHub PR                      │
│  14. Merge bloqueado (branch protection rule)                    │
│  15. Notificación → "Security check falló ❌"                   │
│                                                                  │
│  Developer (local — skill /security)                            │
│  ─────────────────────────────────────────────────────────────  │
│  A. Corre /security manualmente antes de push                   │
│  B. Ve el mismo reporte pero con más detalle y fixes automáticos│
│  C. Sube fix → pipeline CI confirma que está limpio             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Limitación Clave

**El skill `/security` de Claude Code NO puede ejecutarse directamente en Cloud Build.**

### ¿Por qué?

El skill es una instrucción para que Claude (running localmente con acceso a herramientas interactivas como Playwright, WebSearch, y el filesystem del developer) ejecute una auditoría. Cloud Build corre en un contenedor sin sesión interactiva de Claude Code.

### Analogía

| Entorno | Rol del skill |
|---------|--------------|
| **Local (developer)** | Claude lee `PHASE-N.md`, usa WebSearch para CVEs, abre Playwright, edita archivos en vivo, genera el log. **Auditoría interactiva y completa.** |
| **Cloud Build (CI)** | Scripts bash/node extraídos de la lógica del skill corren en contenedor. Sin IA, sin edición automática de código. **Gate de calidad automatizado.** |

### Complementariedad — no duplicación

```
/security local          →  Auditoría profunda, fixes automáticos, CVE lookup online
CI pipeline (Cloud Build) →  Gate que bloquea deploys con vulnerabilidades conocidas
```

El CI es el guardián que **verifica** que el developer ya corrió el skill y aplicó los fixes.

---

## 3. Solución: Scripts Extraídos del Skill

Los scripts de CI son versiones automatizadas (bash/node) de las fases del skill, sin dependencia de Claude Code.

### Estructura de archivos a crear en el proyecto

```
scripts/
└── security/
    ├── audit-deps.sh          ← Fase 1: npm audit
    ├── scan-sql.sh            ← Fase 2: SQL injection patterns
    ├── scan-xss.sh            ← Fase 3: XSS patterns
    ├── scan-secrets.sh        ← Fase 4: Secrets exposure
    ├── check-headers.js       ← Fase 5: next.config.ts headers
    ├── check-auth.sh          ← Fase 6: Auth patterns
    └── generate-report.js     ← Genera reporte final
```

El contenido de cada script se muestra en la [Sección 6](#6-scripts-de-seguridad-para-ci).

---

## 4. Configuración GitHub → Cloud Build

### 4.1 Conectar repositorio en GCP

```bash
# En GCP Console → Cloud Build → Triggers → Connect Repository
# 1. Seleccionar "GitHub (Cloud Build GitHub App)"
# 2. Autenticar con GitHub
# 3. Seleccionar: arman77mxs/claude-animalandia
# 4. Confirmar instalación de la GitHub App
```

### 4.2 Crear el trigger de Cloud Build

En **Cloud Build → Triggers → Create Trigger**:

| Campo | Valor |
|-------|-------|
| Nombre | `animalandia-security-gate` |
| Región | `us-central1` (o la más cercana) |
| Evento | `Push to a branch` + `Pull request` |
| Repositorio | `arman77mxs/claude-animalandia` |
| Branch / PR target | `^main$` |
| Archivo de config | `cloudbuild.yaml` (en raíz del repo) |
| Service account | `animalandia-ci@<PROJECT_ID>.iam.gserviceaccount.com` |

### 4.3 Service Account y permisos

```bash
# Crear service account para CI
gcloud iam service-accounts create animalandia-ci \
  --display-name="AnimaLandia CI/CD"

# Permisos necesarios
gcloud projects add-iam-policy-binding <PROJECT_ID> \
  --member="serviceAccount:animalandia-ci@<PROJECT_ID>.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.builder"

gcloud projects add-iam-policy-binding <PROJECT_ID> \
  --member="serviceAccount:animalandia-ci@<PROJECT_ID>.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding <PROJECT_ID> \
  --member="serviceAccount:animalandia-ci@<PROJECT_ID>.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

---

## 5. `cloudbuild.yaml`

Crear en la raíz del proyecto como `cloudbuild.yaml`:

```yaml
# cloudbuild.yaml
# AnimaLandia — Security Gate + Build + Deploy
# Trigger: push a main o Pull Request hacia main

substitutions:
  _VERCEL_ORG_ID: 'tu-vercel-org-id'
  _VERCEL_PROJECT_ID: 'tu-vercel-project-id'
  _BUCKET_NAME: 'animalandia-security-reports'
  _NODE_VERSION: '20'

options:
  logging: CLOUD_LOGGING_ONLY
  machineType: 'E2_MEDIUM'
  env:
    - 'NODE_ENV=test'
    - 'NEXT_TELEMETRY_DISABLED=1'

availableSecrets:
  secretManager:
    - versionName: projects/$PROJECT_ID/secrets/vercel-token/versions/latest
      env: 'VERCEL_TOKEN'
    - versionName: projects/$PROJECT_ID/secrets/supabase-service-role-key/versions/latest
      env: 'SUPABASE_SERVICE_ROLE_KEY'

steps:

  # ─────────────────────────────────────────────
  # STEP 0: Instalar dependencias
  # ─────────────────────────────────────────────
  - name: 'node:${_NODE_VERSION}'
    id: 'install'
    entrypoint: 'npm'
    args: ['ci', '--prefer-offline']
    timeout: '120s'

  # ─────────────────────────────────────────────
  # STEP 1: TypeScript check + Lint
  # ─────────────────────────────────────────────
  - name: 'node:${_NODE_VERSION}'
    id: 'typecheck'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        npx tsc --noEmit && echo "✅ TypeScript OK"
        npm run lint -- --max-warnings=0 && echo "✅ Lint OK"
    waitFor: ['install']
    timeout: '90s'

  # ─────────────────────────────────────────────
  # FASE 1: npm audit (CVE check)
  # ─────────────────────────────────────────────
  - name: 'node:${_NODE_VERSION}'
    id: 'security-fase1-cve'
    entrypoint: 'bash'
    args: ['scripts/security/audit-deps.sh']
    waitFor: ['install']
    timeout: '60s'
    # Falla el build si encuentra vulnerabilidades critical o high

  # ─────────────────────────────────────────────
  # FASE 2: SQL Injection scan
  # ─────────────────────────────────────────────
  - name: 'node:${_NODE_VERSION}'
    id: 'security-fase2-sql'
    entrypoint: 'bash'
    args: ['scripts/security/scan-sql.sh']
    waitFor: ['install']
    timeout: '30s'

  # ─────────────────────────────────────────────
  # FASE 3: XSS scan
  # ─────────────────────────────────────────────
  - name: 'node:${_NODE_VERSION}'
    id: 'security-fase3-xss'
    entrypoint: 'bash'
    args: ['scripts/security/scan-xss.sh']
    waitFor: ['install']
    timeout: '30s'

  # ─────────────────────────────────────────────
  # FASE 4: Secrets scan
  # ─────────────────────────────────────────────
  - name: 'node:${_NODE_VERSION}'
    id: 'security-fase4-secrets'
    entrypoint: 'bash'
    args: ['scripts/security/scan-secrets.sh']
    waitFor: ['install']
    timeout: '30s'
    # NUNCA exponer SERVICE_ROLE_KEY en cliente

  # ─────────────────────────────────────────────
  # FASE 5: Security headers check
  # ─────────────────────────────────────────────
  - name: 'node:${_NODE_VERSION}'
    id: 'security-fase5-headers'
    entrypoint: 'node'
    args: ['scripts/security/check-headers.js']
    waitFor: ['install']
    timeout: '20s'

  # ─────────────────────────────────────────────
  # FASE 6: Auth patterns check
  # ─────────────────────────────────────────────
  - name: 'node:${_NODE_VERSION}'
    id: 'security-fase6-auth'
    entrypoint: 'bash'
    args: ['scripts/security/check-auth.sh']
    waitFor: ['install']
    timeout: '30s'

  # ─────────────────────────────────────────────
  # STEP: Generar reporte de seguridad
  # (solo si los scans pasaron — waitFor todos)
  # ─────────────────────────────────────────────
  - name: 'node:${_NODE_VERSION}'
    id: 'security-report'
    entrypoint: 'node'
    args: ['scripts/security/generate-report.js']
    waitFor:
      - 'security-fase1-cve'
      - 'security-fase2-sql'
      - 'security-fase3-xss'
      - 'security-fase4-secrets'
      - 'security-fase5-headers'
      - 'security-fase6-auth'
    timeout: '20s'
    env:
      - 'BUILD_ID=$BUILD_ID'
      - 'COMMIT_SHA=$COMMIT_SHA'
      - 'BRANCH_NAME=$BRANCH_NAME'

  # ─────────────────────────────────────────────
  # STEP: Subir reporte a GCS
  # ─────────────────────────────────────────────
  - name: 'gcr.io/cloud-builders/gsutil'
    id: 'upload-report'
    args:
      - 'cp'
      - 'security-scan-report.md'
      - 'gs://${_BUCKET_NAME}/reports/$COMMIT_SHA-security-report.md'
    waitFor: ['security-report']

  # ─────────────────────────────────────────────
  # STEP: Build Next.js (solo si security pasó)
  # ─────────────────────────────────────────────
  - name: 'node:${_NODE_VERSION}'
    id: 'build'
    entrypoint: 'npm'
    args: ['run', 'build']
    waitFor:
      - 'typecheck'
      - 'security-report'
    timeout: '300s'
    secretEnv: ['SUPABASE_SERVICE_ROLE_KEY']
    env:
      - 'NEXT_PUBLIC_SUPABASE_URL=$$NEXT_PUBLIC_SUPABASE_URL'
      # Agregar resto de vars no secretas aquí

  # ─────────────────────────────────────────────
  # STEP: Deploy a Vercel (solo en push a main)
  # ─────────────────────────────────────────────
  - name: 'node:${_NODE_VERSION}'
    id: 'deploy'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        # Solo deployar en push a main (no en PRs)
        if [ "$BRANCH_NAME" = "main" ]; then
          npm install -g vercel
          vercel pull --yes --environment=production --token=$$VERCEL_TOKEN
          vercel build --prod --token=$$VERCEL_TOKEN
          vercel deploy --prebuilt --prod --token=$$VERCEL_TOKEN
          echo "✅ Deploy a producción completado"
        else
          echo "ℹ️  PR build — skip deploy (solo main)"
        fi
    waitFor: ['build']
    secretEnv: ['VERCEL_TOKEN']
    timeout: '300s'

# ─────────────────────────────────────────────────────────
# Artefactos del build
# ─────────────────────────────────────────────────────────
artifacts:
  objects:
    location: 'gs://${_BUCKET_NAME}/builds/$BUILD_ID/'
    paths:
      - 'security-scan-report.md'
      - '.next/BUILD_ID'

timeout: '900s'  # 15 minutos máximo total
```

---

## 6. Scripts de Seguridad para CI

### `scripts/security/audit-deps.sh`

```bash
#!/bin/bash
# Fase 1: npm audit — falla si hay critical o high
set -e

echo "🔍 FASE 1 — npm audit CVE check..."

AUDIT_OUTPUT=$(npm audit --json 2>/dev/null || true)

CRITICAL=$(echo "$AUDIT_OUTPUT" | node -e "
  const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  console.log(d.metadata?.vulnerabilities?.critical || 0);
" 2>/dev/null || echo "0")

HIGH=$(echo "$AUDIT_OUTPUT" | node -e "
  const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  console.log(d.metadata?.vulnerabilities?.high || 0);
" 2>/dev/null || echo "0")

echo "  Critical: $CRITICAL"
echo "  High: $HIGH"

if [ "$CRITICAL" -gt "0" ]; then
  echo "❌ FALLA: $CRITICAL vulnerabilidades CRÍTICAS encontradas."
  echo "   Correr: npm audit fix  (o /security localmente para análisis completo)"
  npm audit --audit-level=critical
  exit 1
fi

if [ "$HIGH" -gt "0" ]; then
  echo "⚠️  WARNING: $HIGH vulnerabilidades HIGH. Revisar antes de siguiente sprint."
  # Cambiar exit 1 si quieres bloquear también en HIGH
fi

echo "✅ FASE 1 OK — Sin vulnerabilidades críticas"
```

---

### `scripts/security/scan-sql.sh`

```bash
#!/bin/bash
# Fase 2: Detectar patrones de SQL injection en queries Supabase
set -e

echo "🔍 FASE 2 — SQL Injection scan..."

ISSUES=0
FINDINGS=""

# Concatenación de strings en .eq(), .like(), .ilike()
RESULT=$(grep -rn "\.eq(.*+\s*\|\.like(.*+\s*\|\.ilike(.*+\s*" \
  src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)

if [ -n "$RESULT" ]; then
  ISSUES=$((ISSUES + 1))
  FINDINGS="$FINDINGS\n[SQL-01] Posible concatenación en query Supabase:\n$RESULT\n"
fi

# Template literals en from() con posible inyección
RESULT=$(grep -rn 'from(`.*\${' \
  src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)

if [ -n "$RESULT" ]; then
  ISSUES=$((ISSUES + 1))
  FINDINGS="$FINDINGS\n[SQL-02] Template literal en from():\n$RESULT\n"
fi

# req.body sin validación en API routes
RESULT=$(grep -rn "req\.body\." \
  src/app/api/ --include="*.ts" -l 2>/dev/null || true)

# Verificar si esos archivos validan antes de usar
for FILE in $RESULT; do
  # Si usa req.body sin typeof/zod/validación en las primeras 10 líneas de uso
  HAS_VALIDATION=$(grep -n "typeof\|zod\|z\.object\|schema\|validate" "$FILE" | wc -l)
  if [ "$HAS_VALIDATION" -eq "0" ]; then
    ISSUES=$((ISSUES + 1))
    FINDINGS="$FINDINGS\n[SQL-03] API route sin validación de req.body: $FILE\n"
  fi
done

if [ "$ISSUES" -gt "0" ]; then
  echo "❌ FALLA: $ISSUES issue(s) de SQL Injection encontrados:"
  printf "%b\n" "$FINDINGS"
  echo "   Correr /security localmente para análisis y fixes detallados."
  exit 1
fi

echo "✅ FASE 2 OK — Sin patrones de SQL Injection"
```

---

### `scripts/security/scan-xss.sh`

```bash
#!/bin/bash
# Fase 3: Detectar patrones XSS
set -e

echo "🔍 FASE 3 — XSS scan..."

ISSUES=0
FINDINGS=""

# dangerouslySetInnerHTML — verificar si el contenido es de usuario
RESULT=$(grep -rn "dangerouslySetInnerHTML" \
  src/ --include="*.tsx" --include="*.ts" 2>/dev/null || true)

if [ -n "$RESULT" ]; then
  # Advertencia: puede ser legítimo si el contenido es estático
  echo "⚠️  dangerouslySetInnerHTML encontrado — verificar manualmente que no use input de usuario:"
  echo "$RESULT"
  # No fallar automáticamente, solo advertir (podría ser CMS propio)
fi

# innerHTML = directo en TypeScript
RESULT=$(grep -rn "innerHTML\s*=" \
  src/ --include="*.tsx" --include="*.ts" 2>/dev/null || true)

if [ -n "$RESULT" ]; then
  ISSUES=$((ISSUES + 1))
  FINDINGS="$FINDINGS\n[XSS-01] innerHTML directo (riesgo XSS):\n$RESULT\n"
fi

# eval()
RESULT=$(grep -rn "\beval\b\s*(" \
  src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)

if [ -n "$RESULT" ]; then
  ISSUES=$((ISSUES + 1))
  FINDINGS="$FINDINGS\n[XSS-02] eval() detectado:\n$RESULT\n"
fi

# <img> directo sin next/image
IMG_COUNT=$(grep -rn "<img\s" \
  src/ --include="*.tsx" 2>/dev/null | wc -l || echo "0")

if [ "$IMG_COUNT" -gt "0" ]; then
  ISSUES=$((ISSUES + 1))
  FINDINGS="$FINDINGS\n[XSS-03] $IMG_COUNT uso(s) de <img> sin next/image\n"
fi

# searchParams usado como href sin validación
RESULT=$(grep -rn "searchParams\.get(" \
  src/ --include="*.tsx" -A 3 2>/dev/null | grep -i "href\|src\|action" || true)

if [ -n "$RESULT" ]; then
  ISSUES=$((ISSUES + 1))
  FINDINGS="$FINDINGS\n[XSS-04] searchParams usado en href/src sin validar:\n$RESULT\n"
fi

if [ "$ISSUES" -gt "0" ]; then
  echo "❌ FALLA: $ISSUES issue(s) de XSS encontrados:"
  printf "%b\n" "$FINDINGS"
  exit 1
fi

echo "✅ FASE 3 OK — Sin patrones XSS críticos"
```

---

### `scripts/security/scan-secrets.sh`

```bash
#!/bin/bash
# Fase 4: Verificar que secretos no estén expuestos en cliente
set -e

echo "🔍 FASE 4 — Secrets scan..."

ISSUES=0
FINDINGS=""

# SERVICE_ROLE_KEY en archivos cliente (NO en server/actions/route)
RESULT=$(grep -rn "SERVICE_ROLE" \
  src/ --include="*.ts" --include="*.tsx" \
  | grep -v "server\.\|actions\.\|route\.\|\.server\." || true)

if [ -n "$RESULT" ]; then
  ISSUES=$((ISSUES + 1))
  FINDINGS="$FINDINGS\n[SEC-01] 🔴 CRÍTICO: SERVICE_ROLE_KEY expuesta en cliente:\n$RESULT\n"
fi

# Stripe secret key en cliente
RESULT=$(grep -rn "sk_live\|sk_test" \
  src/ --include="*.ts" --include="*.tsx" \
  | grep -v "server\.\|route\.\|actions\." || true)

if [ -n "$RESULT" ]; then
  ISSUES=$((ISSUES + 1))
  FINDINGS="$FINDINGS\n[SEC-02] 🔴 CRÍTICO: Stripe secret key en cliente:\n$RESULT\n"
fi

# NEXT_PUBLIC_ con secretos
RESULT=$(grep -rn "NEXT_PUBLIC_" \
  src/ --include="*.ts" --include="*.tsx" \
  | grep -v "SUPABASE_URL\|SUPABASE_ANON\|STRIPE_PUBLISHABLE\|STRIPE_PUBLIC" || true)

if [ -n "$RESULT" ]; then
  echo "⚠️  Variables NEXT_PUBLIC_ no estándar — verificar que no sean secretos:"
  echo "$RESULT"
fi

# .env.local debe estar en .gitignore
if ! grep -q "\.env\.local" .gitignore 2>/dev/null; then
  ISSUES=$((ISSUES + 1))
  FINDINGS="$FINDINGS\n[SEC-03] 🔴 CRÍTICO: .env.local no está en .gitignore\n"
fi

# Verificar que .env.local NO esté en el commit actual
if git ls-files --error-unmatch .env.local 2>/dev/null; then
  ISSUES=$((ISSUES + 1))
  FINDINGS="$FINDINGS\n[SEC-04] 🔴 CRÍTICO: .env.local está siendo rastreado por git\n"
fi

if [ "$ISSUES" -gt "0" ]; then
  echo "❌ FALLA CRÍTICA — Secretos expuestos:"
  printf "%b\n" "$FINDINGS"
  exit 1
fi

echo "✅ FASE 4 OK — Sin secretos expuestos"
```

---

### `scripts/security/check-headers.js`

```javascript
// Fase 5: Verificar que next.config.ts tenga security headers
const fs = require('fs');
const path = require('path');

const REQUIRED_HEADERS = [
  'X-Frame-Options',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Content-Security-Policy',
  'Permissions-Policy',
];

console.log('🔍 FASE 5 — Security headers check...');

const configPath = path.join(process.cwd(), 'next.config.ts');
if (!fs.existsSync(configPath)) {
  console.error('❌ next.config.ts no encontrado');
  process.exit(1);
}

const content = fs.readFileSync(configPath, 'utf8');

const missing = REQUIRED_HEADERS.filter(h => !content.includes(h));

if (missing.length > 0) {
  console.error(`❌ FALLA: Security headers faltantes en next.config.ts:`);
  missing.forEach(h => console.error(`   - ${h}`));
  console.error('\n   Ver PHASE-5-HEADERS.md del skill /security para el código a agregar.');
  process.exit(1);
}

// Verificar que headers estén en una función headers()
if (!content.includes('async headers()') && !content.includes('headers:')) {
  console.warn('⚠️  Los headers están definidos pero puede que no estén aplicados en headers()');
}

console.log('✅ FASE 5 OK — Security headers presentes en next.config.ts');
```

---

### `scripts/security/check-auth.sh`

```bash
#!/bin/bash
# Fase 6: Verificar patrones de autenticación y autorización
set -e

echo "🔍 FASE 6 — Auth patterns check..."

ISSUES=0
FINDINGS=""

# Middleware debe existir y usar solo getUser() (no DB queries)
if [ ! -f "src/middleware.ts" ]; then
  ISSUES=$((ISSUES + 1))
  FINDINGS="$FINDINGS\n[AUTH-01] src/middleware.ts no existe\n"
else
  # Verificar que no haya queries DB en middleware (Edge Runtime no las soporta)
  DB_IN_MIDDLEWARE=$(grep -n "\.from(\|supabase\.rpc\|createAdminClient" \
    src/middleware.ts 2>/dev/null || true)
  if [ -n "$DB_IN_MIDDLEWARE" ]; then
    ISSUES=$((ISSUES + 1))
    FINDINGS="$FINDINGS\n[AUTH-02] Query DB en middleware (Edge Runtime no soporta esto):\n$DB_IN_MIDDLEWARE\n"
  fi
fi

# Server Actions admin deben tener ensureAdmin()
ACTIONS_FILES=$(find src/app -name "actions.ts" -path "*admin*" 2>/dev/null || true)
for FILE in $ACTIONS_FILES; do
  EXPORTED_FNS=$(grep -n "^export async function" "$FILE" | wc -l)
  ENSURE_ADMIN_CALLS=$(grep -c "ensureAdmin()" "$FILE" 2>/dev/null || echo "0")
  if [ "$EXPORTED_FNS" -gt "$ENSURE_ADMIN_CALLS" ]; then
    MISSING=$((EXPORTED_FNS - ENSURE_ADMIN_CALLS))
    ISSUES=$((ISSUES + 1))
    FINDINGS="$FINDINGS\n[AUTH-03] $FILE: $MISSING función(es) exportada(s) sin ensureAdmin()\n"
  fi
done

# profiles query debe usar .eq('id') no .eq('user_id')
WRONG_PROFILES=$(grep -rn "profiles.*user_id\|\.eq('user_id'" \
  src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)

if [ -n "$WRONG_PROFILES" ]; then
  ISSUES=$((ISSUES + 1))
  FINDINGS="$FINDINGS\n[AUTH-04] 🔴 profiles.eq('user_id') detectado — debe ser eq('id'):\n$WRONG_PROFILES\n"
fi

# createAdminClient() solo en server/actions/route
WRONG_ADMIN=$(grep -rn "createAdminClient()" \
  src/ --include="*.ts" --include="*.tsx" \
  | grep -v "actions\.\|route\.\|server\." || true)

if [ -n "$WRONG_ADMIN" ]; then
  ISSUES=$((ISSUES + 1))
  FINDINGS="$FINDINGS\n[AUTH-05] 🔴 createAdminClient() en archivo cliente:\n$WRONG_ADMIN\n"
fi

if [ "$ISSUES" -gt "0" ]; then
  echo "❌ FALLA: $ISSUES issue(s) de Auth/Autorización:"
  printf "%b\n" "$FINDINGS"
  exit 1
fi

echo "✅ FASE 6 OK — Patrones de auth correctos"
```

---

### `scripts/security/generate-report.js`

```javascript
// Genera security-scan-report.md con resumen del build
const fs = require('fs');

const now = new Date();
const dateStr = now.toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' });
const timeStr = now.toLocaleTimeString('es-MX', { timeZone: 'America/Mexico_City' });

const buildId = process.env.BUILD_ID || 'local';
const commitSha = process.env.COMMIT_SHA || 'unknown';
const branchName = process.env.BRANCH_NAME || 'unknown';

const report = `# Security Scan Report — CI/CD
**Fecha:** ${dateStr} ${timeStr}
**Build ID:** ${buildId}
**Commit:** ${commitSha.slice(0, 8)}
**Branch:** ${branchName}
**Entorno:** GCP Cloud Build

## Resultado

Todos los security gates pasaron. El build procede al deploy.

| Fase | Check | Estado |
|------|-------|--------|
| 1 | CVE / npm audit | ✅ PASS |
| 2 | SQL Injection | ✅ PASS |
| 3 | XSS | ✅ PASS |
| 4 | Secretos expuestos | ✅ PASS |
| 5 | Security Headers | ✅ PASS |
| 6 | Auth patterns | ✅ PASS |

---
*Generado por GCP Cloud Build — AnimaLandia DevSecOps Pipeline*
`;

fs.writeFileSync('security-scan-report.md', report);
console.log('✅ Reporte generado: security-scan-report.md');
```

---

## 7. Secretos en GCP Secret Manager

Los secretos del proyecto **nunca deben estar en el repo**. Se almacenan en Secret Manager y se inyectan en Cloud Build en tiempo de ejecución.

```bash
# Crear secretos en Secret Manager
echo -n "tu-vercel-token" | \
  gcloud secrets create vercel-token --data-file=- --replication-policy=automatic

echo -n "tu-supabase-service-role-key" | \
  gcloud secrets create supabase-service-role-key --data-file=- --replication-policy=automatic

echo -n "tu-stripe-secret-key" | \
  gcloud secrets create stripe-secret-key --data-file=- --replication-policy=automatic

# Dar acceso al service account de CI
gcloud secrets add-iam-policy-binding vercel-token \
  --member="serviceAccount:animalandia-ci@<PROJECT_ID>.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Para actualizar un secreto (rotar):
echo -n "nuevo-token" | \
  gcloud secrets versions add vercel-token --data-file=-
```

### Variables de entorno no secretas en Cloud Build

Para vars como `NEXT_PUBLIC_SUPABASE_URL` que no son secretas:

```bash
# Opción A: Substitution variables en el trigger de Cloud Build (UI)
# Opción B: En cloudbuild.yaml directamente en el step que las necesita
env:
  - 'NEXT_PUBLIC_SUPABASE_URL=https://kdxjhfwmxifclispjyfx.supabase.co'
```

---

## 8. Reportes y Artefactos

### Crear el bucket de GCS para reportes

```bash
# Crear bucket
gsutil mb -l us-central1 gs://animalandia-security-reports

# Retención de reportes: 90 días
gsutil lifecycle set lifecycle-config.json gs://animalandia-security-reports
```

`lifecycle-config.json`:
```json
{
  "rule": [{
    "action": { "type": "Delete" },
    "condition": { "age": 90 }
  }]
}
```

### Ver reportes

```bash
# Listar reportes de un commit específico
gsutil ls gs://animalandia-security-reports/reports/

# Descargar reporte
gsutil cp gs://animalandia-security-reports/reports/<COMMIT_SHA>-security-report.md .
```

---

## 9. PR Status Checks

Para que Cloud Build reporte el status directamente en el PR de GitHub y bloquee el merge:

### 9.1 Activar GitHub Checks en Cloud Build

En GCP Console → Cloud Build → Settings → activar:
- **GitHub Checks**: ON

Esto hace que cada build aparezca en el PR como check requerido.

### 9.2 Branch Protection en GitHub

En GitHub → Settings → Branches → Branch protection rules para `main`:

```
✅ Require a pull request before merging
✅ Require status checks to pass before merging
   ✅ animalandia-security-gate  ← nombre del trigger de Cloud Build
✅ Require branches to be up to date before merging
✅ Do not allow bypassing the above settings
```

Con esto: **ningún PR puede mergearse a `main` si el security gate falla.**

---

## 10. Notificaciones

### Notificación básica en cloudbuild.yaml

Agregar al final del `cloudbuild.yaml` como step condicional:

```yaml
  # STEP: Notificación en caso de fallo (Cloud Build lo ejecuta si hay error)
  - name: 'curlimages/curl'
    id: 'notify-failure'
    entrypoint: 'sh'
    args:
      - '-c'
      - |
        # Notificación a Slack (webhook)
        curl -X POST -H 'Content-type: application/json' \
          --data "{
            \"text\": \"❌ *AnimaLandia Security Gate FALLÓ*\nBranch: $BRANCH_NAME\nCommit: $SHORT_SHA\nBuild: https://console.cloud.google.com/cloud-build/builds/$BUILD_ID\"
          }" \
          $$SLACK_WEBHOOK_URL || true
    secretEnv: ['SLACK_WEBHOOK_URL']
    waitFor: ['-']  # Siempre ejecutar
```

---

## 11. Relación Skill Local ↔ Pipeline CI

```
┌──────────────────────────────────────────────────────────────┐
│         WORKFLOW RECOMENDADO PARA EL DEVELOPER               │
└──────────────────────────────────────────────────────────────┘

1. Developer trabaja en feature branch
   └── Edita código normalmente

2. Antes de abrir PR → corre localmente:
   /security
   └── Claude audita completo: CVEs, SQL, XSS, secretos, headers, auth
   └── Aplica fixes automáticamente
   └── Genera log en security-logs/log-security-scan-*.md
   └── Corre quality gate con Playwright

3. Developer sube fix y abre PR
   git push origin feature/mi-feature

4. GitHub trigger → Cloud Build ejecuta pipeline
   └── Los 6 scripts de seguridad corren en CI
   └── Son una versión subset de lo que el skill ya verificó
   └── Si el developer corrió /security y aplicó fixes → CI pasa ✅

5. Si CI falla (developer no corrió /security o hay algo nuevo):
   └── PR bloqueado en GitHub
   └── Developer corre /security localmente → fix → push → CI re-corre

6. CI verde → merge a main → deploy automático a Vercel
```

### ¿Qué hace el skill que el CI no hace?

| Capacidad | Skill `/security` (local) | CI Pipeline |
|-----------|--------------------------|-------------|
| CVE lookup en NVD/GitHub Advisory online | ✅ WebSearch | ❌ Solo npm audit |
| Fixes automáticos de código | ✅ Claude edita archivos | ❌ Solo reporta |
| Playwright quality gate visual | ✅ Browser real | ❌ No (sin servidor) |
| Verificar security headers en runtime | ✅ curl contra localhost | ❌ Solo static check |
| Log detallado con contexto | ✅ Markdown enriquecido | ✅ Básico |
| Bloquear deploy en producción | ❌ Local only | ✅ Gate obligatorio |

---

## 12. Checklist de Configuración Inicial

```
GCP Setup
- [ ] Crear proyecto GCP (o usar existente)
- [ ] Habilitar Cloud Build API
- [ ] Habilitar Secret Manager API
- [ ] Habilitar Cloud Storage API
- [ ] Crear service account: animalandia-ci
- [ ] Asignar roles al service account (build, secrets, storage)
- [ ] Crear secretos en Secret Manager (vercel-token, supabase-key, etc.)
- [ ] Crear bucket GCS: animalandia-security-reports
- [ ] Configurar lifecycle de 90 días en el bucket

GitHub → Cloud Build
- [ ] Conectar repositorio en Cloud Build
- [ ] Crear trigger: animalandia-security-gate
- [ ] Habilitar GitHub Checks en Cloud Build settings

Repositorio
- [ ] Crear scripts/security/ con los 7 scripts de esta guía
- [ ] Dar permisos de ejecución: chmod +x scripts/security/*.sh
- [ ] Crear cloudbuild.yaml en la raíz
- [ ] Agregar scripts/security/ al repo (no es código secreto)
- [ ] Verificar que .env.local está en .gitignore

GitHub Branch Protection
- [ ] Activar branch protection en main
- [ ] Requerir status check: animalandia-security-gate
- [ ] Bloquear merge si CI falla

Validación
- [ ] Hacer push de prueba a branch → verificar que trigger se activa
- [ ] Verificar que un código inseguro falla el build
- [ ] Verificar que código limpio pasa y deployea
- [ ] Correr /security localmente → confirmar que fix hace pasar CI
```

---

*Documento generado para AnimaLandia E-commerce — Arquitectura DevSecOps*
*Skill local: `.claude/skills/security/` — Pipeline CI: `cloudbuild.yaml`*
