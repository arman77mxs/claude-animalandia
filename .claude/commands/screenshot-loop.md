# /screenshot-loop

Auditoría visual automática del proyecto actual.

## Instrucciones para Claude:

1. Verifica que `npm run dev` esté corriendo en puerto 3000
2. Usa Playwright MCP para capturar screenshots de:
   - Desktop (1440px)
   - Tablet (768px)  
   - Mobile (375px)
3. Analiza cada screenshot buscando:
   - Elementos desalineados
   - Textos que se cortan
   - Espaciados inconsistentes
   - Colores que no contrastan bien
   - Componentes rotos en mobile
4. Lista todos los issues encontrados
5. Corrige uno por uno
6. Repite el ciclo hasta cero issues visuales
7. Genera reporte final con before/after