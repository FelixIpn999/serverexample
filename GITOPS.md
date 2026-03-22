# GITOPS del Proyecto `serverexample`

Este documento define las reglas y el proceso operativo para publicar cambios de aplicacion e infraestructura en este repositorio.

## 1) Objetivo

Mantener `main` como estado ideal, estable y auditable del sistema, usando:

- Git como unica fuente de verdad.
- Cambios solo via Pull Request.
- Reglas de proteccion en ramas y ambientes.
- Promocion controlada de cambios.

## 2) Fundamento tecnico de GitOps

GitOps en este proyecto significa:

1. **Estado deseado en Git**
   - Codigo en `src/`
   - Infraestructura en `terraform/`
   - Configuracion y convenciones versionadas.

2. **Cambio por PR, no por comando manual**
   - Nada de cambios directos en `main` para flujo normal.
   - Toda modificacion debe quedar trazable en commit + PR.

3. **Automatizacion y consistencia**
   - El pipeline valida y aplica en orden.
   - El mismo proceso se repite para todos los cambios.

4. **Auditabilidad y rollback**
   - Cada cambio tiene autor, fecha y diff.
   - Si algo falla, se revierte via Git con historial claro.

## 3) Reglas que quedaron definidas

### 3.1 Rama principal

`main` es la rama protegida y representa el estado ideal del repositorio.

Reglas activas (definidas en GitHub):

- Requiere Pull Request para integrar cambios.
- Bloquea force push.
- Bloquea borrado de rama principal.
- Requiere resolver conversaciones del PR.
- Mantiene historial lineal (sin merge commits no deseados).

Nota: el `admin bypass` puede existir para emergencias, pero su uso debe ser excepcional y documentado.

### 3.2 Ambientes de despliegue

- `dev`: permitido para `main`, sin friccion innecesaria para iterar rapido.
- `stage`: permitido para `main`, con control adicional segun definicion actual del repositorio.

## 4) Estrategia de branches

Se usa enfoque de ramas cortas sobre `main`.

## 4.1 Tipos de branch

- `feature/<descripcion-corta>`: nueva funcionalidad.
- `fix/<descripcion-corta>`: correccion de bug.
- `refactor/<descripcion-corta>`: mejora interna sin cambio funcional externo.
- `test/<descripcion-corta>`: pruebas.
- `docs/<descripcion-corta>`: documentacion.
- `infra/<descripcion-corta>`: cambios Terraform/infraestructura.
- `chore/<descripcion-corta>`: tareas de mantenimiento.

## 4.2 Reglas de nombrado

- Usar minusculas y guiones (`kebab-case`).
- Nombre claro y corto.
- Evitar ramas genericas como `cambios`, `prueba`, `temp`.

Ejemplos:

- `feature/create-product-endpoint`
- `fix/validation-product-stock`
- `infra/add-dynamodb-policy`
- `docs/update-gitops-guide`

## 5) Convencion de commits

Usar Conventional Commits:

- `feat: ...`
- `fix: ...`
- `refactor: ...`
- `test: ...`
- `docs: ...`
- `infra: ...`
- `chore: ...`
- `ci: ...`

Ejemplos:

- `feat: add endpoint to create product`
- `fix: validate stock before save`
- `infra: add ecs task permission for dynamodb`
- `docs: update gitops workflow`

## 6) Proceso estandar para que un developer publique cambios

Este es el flujo oficial para integracion a `main`.

### Paso 1: sincronizar base local

```bash
git checkout main
git pull origin main
```

### Paso 2: crear branch de trabajo

```bash
git checkout -b feature/mi-cambio
```

### Paso 3: implementar y commitear en bloques pequenos

```bash
git add <archivos>
git commit -m "feat: descripcion concreta"
```

Recomendacion:

- Commits pequenos, con un objetivo por commit.
- Evitar commits gigantes sin contexto.

### Paso 4: validar local antes de publicar

```bash
npm test
npm run build
```

Si hay infraestructura en el cambio, adicionalmente:

```bash
cd terraform
terraform fmt -check
terraform validate
```

### Paso 5: subir branch al remoto

```bash
git push -u origin feature/mi-cambio
```

### Paso 6: abrir Pull Request hacia `main`

En GitHub:

- Base: `main`
- Compare: tu branch
- Titulo claro (alineado con el cambio)
- Descripcion con:
  - Que cambia
  - Por que cambia
  - Como se valido

### Paso 7: atender revision

Si hay feedback:

```bash
git add <archivos>
git commit -m "fix: address pr review comments"
git push
```

### Paso 8: merge de PR

Cuando cumpla reglas y validaciones:

- Hacer merge desde GitHub.
- Preferir historial limpio (squash/rebase segun politica activa).

### Paso 9: limpieza post-merge

```bash
git checkout main
git pull origin main
git branch -d feature/mi-cambio
git push origin --delete feature/mi-cambio
```

## 7) Definicion de estado ideal del repositorio

`main` ideal significa:

- Siempre desplegable.
- Sin secretos ni artefactos generados.
- Sin cambios manuales fuera del flujo PR.
- Con historial entendible y trazable.

## 8) Checklist obligatorio antes de merge

- [ ] Rama creada desde `main` actualizada.
- [ ] Commits con convencion clara.
- [ ] `npm test` exitoso.
- [ ] `npm run build` exitoso.
- [ ] Si aplica infra: `terraform fmt -check` y `terraform validate`.
- [ ] PR con descripcion tecnica suficiente.
- [ ] Conversaciones del PR resueltas.

## 9) Anti patrones (no permitido)

- Push directo a `main` como flujo normal.
- Trabajar semanas en una rama sin integrar.
- Commitear `node_modules`, `dist`, `coverage`, `.env`, `*.tfstate`.
- Cambios de infraestructura por consola sin pasar por Git.
- Usar mensajes de commit ambiguos (`update`, `fix stuff`, `changes`).

## 10) Politica de excepciones

Si hay incidente critico y se usa bypass de admin:

1. Registrar motivo tecnico en PR o issue.
2. Aplicar el fix minimo.
3. Abrir PR de post-mortem/correccion estructural.
4. Restablecer flujo normal inmediatamente.

---

## Resumen operativo rapido

1. Actualiza `main`.
2. Crea branch corto y descriptivo.
3. Implementa + valida local.
4. Push del branch.
5. Abre PR a `main`.
6. Corrige feedback.
7. Merge.
8. Limpieza de branch.

Este es el camino oficial para mantener calidad tecnica, trazabilidad y disciplina GitOps en `serverexample`.

