# Arquitectura del Proyecto

## 📐 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                     Scripts Ejecutables                      │
│                                                              │
│  ┌──────────┐  ┌─────────────┐  ┌────────────────┐         │
│  │ login.ts │  │ download.ts │  │ with-session.ts│         │
│  └────┬─────┘  └──────┬──────┘  └────────┬───────┘         │
│       │               │                  │                  │
└───────┼───────────────┼──────────────────┼──────────────────┘
        │               │                  │
        └───────────────┴──────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼────────┐             ┌────────▼────────┐
│  Page Objects  │             │  Configuración  │
│                │             │                 │
│ ┌────────────┐ │             │  ┌───────────┐ │
│ │ LoginPage  │ │             │  │ config.ts │ │
│ └────────────┘ │             │  └───────────┘ │
│ ┌────────────┐ │             │                 │
│ │DownloadPage│ │             │  • URLs         │
│ └────────────┘ │             │  • Paths        │
│                │             │  • Browser cfg  │
│ Encapsulan:    │             │  • Credentials  │
│ • Selectores   │             └─────────────────┘
│ • Navegación   │
│ • Interacciones│
└────────┬───────┘
         │
    ┌────▼────┐
    │ Utils   │
    │         │
    │ logger  │
    └─────────┘
```

## 🔄 Flujo de Login

```
┌──────────┐
│  Inicio  │
└────┬─────┘
     │
     ▼
┌─────────────────┐
│ Validar .env    │
│ (config.ts)     │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Lanzar Browser  │
│ (Playwright)    │
└────┬────────────┘
     │
     ▼
┌─────────────────────┐
│ LoginPage.login()   │
│  • Ir a h5p.org     │
│  • Clic "Log in"    │
│  • Llenar form      │
│  • Submit           │
│  • Verificar        │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Guardar sesión      │
│ (h5p-auth.json)     │
└────┬────────────────┘
     │
     ▼
┌──────────┐
│  Éxito   │
└──────────┘
```

## 🔄 Flujo de Descarga

```
┌──────────┐
│  Inicio  │
└────┬─────┘
     │
     ▼
┌─────────────────────┐
│ Verificar sesión    │
│ (h5p-auth.json)     │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Lanzar con sesión   │
│ (storageState)      │
└────┬────────────────┘
     │
     ▼
┌──────────────────────────┐
│ DownloadPage.download()  │
│  • Ir a ejemplos         │
│  • Navegar a contenido   │
│  • Entrar a iframe       │
│  • Clic "Reuse"          │
│  • Clic "Download"       │
│  • Guardar archivo       │
└────┬─────────────────────┘
     │
     ▼
┌────────────────┐
│ Archivo .h5p   │
│ en /downloads  │
└────────────────┘
```

## 🗂️ Responsabilidades

### config.ts

- ✅ Centraliza todas las configuraciones
- ✅ Lee variables de entorno
- ✅ Define URLs, paths, opciones browser
- ✅ Valida credenciales

### Page Objects (src/pages/)

- ✅ Encapsulan interacciones con páginas
- ✅ Abstraen selectores y navegación
- ✅ Proporcionan API simple para scripts
- ✅ Reutilizables en múltiples scripts

### Logger (src/utils/)

- ✅ Output consistente con colores
- ✅ Timestamps automáticos
- ✅ Niveles: info, success, warn, error, debug
- ✅ Simple pero efectivo

### Scripts (src/\*.ts)

- ✅ Orquestan el flujo de automatización
- ✅ Manejan errores y screenshots
- ✅ Usan Page Objects y config
- ✅ Un propósito claro cada uno

## 🎯 Principios de Diseño

### 1. Separación de Responsabilidades

Cada módulo tiene una responsabilidad clara y única.

### 2. Don't Repeat Yourself (DRY)

Page Objects evitan duplicación de selectores y lógica.

### 3. Single Source of Truth

Toda la config en un solo lugar (config.ts).

### 4. Composition over Inheritance

Scripts componen funcionalidad usando Page Objects.

### 5. Fail Fast

Validaciones tempranas con errores claros.

## 🚀 Agregar Nueva Funcionalidad

### Nuevo tipo de contenido para descargar

1. **Crea script** → `src/download-nuevo.ts`
2. **Reutiliza** → `H5PDownloadPage`
3. **Configura** → Agrega URL si es necesario a `config.ts`
4. **Ejecuta** → `npm run download:nuevo`

### Nueva página para automatizar

1. **Crea Page Object** → `src/pages/nueva-page.ts`
2. **Define métodos** → Encapsula la lógica
3. **Usa en scripts** → Importa y utiliza
4. **Documenta** → Agrega a README

## ✅ Ventajas de Esta Arquitectura

- ✅ **Escalable**: Fácil agregar nuevos scripts
- ✅ **Mantenible**: Cambios en un solo lugar
- ✅ **Testeable**: Page Objects facilitan testing
- ✅ **Legible**: Flujo claro y directo
- ✅ **Profesional**: Patrones reconocidos de la industria
