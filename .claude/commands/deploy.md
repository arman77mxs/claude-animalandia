# /deploy

Deploy del proyecto a Vercel con validación previa.

## Instrucciones para Claude:

1. Ejecuta `npm run build` — si falla, corrige errores primero
2. Ejecuta `npm run lint` — corrige warnings críticos
3. Verifica variables de entorno en .env.local
4. `git add .`
5. `git commit -m "feat: [descripción del cambio]"`
6. `git push origin develop`
7. Muestra la preview URL de Vercel generada
8. Ejecuta screenshot-loop contra la preview URL