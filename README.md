# Verificacion de Certificados con QR

Aplicacion web publica para validar certificados mediante codigo unico y URL QR.

## Tecnologias

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Base de datos local en JSON
- Compatible con Vercel

## Funcionalidades

- Busqueda por codigo desde la pagina principal
- Redireccion automatica a `/verificar/[codigo]`
- Verificacion de certificado valido o invalido
- Visualizacion de nombre, curso, fecha y codigo
- Boton para descargar PDF del certificado
- Boton para copiar codigo
- Validacion en tiempo real del formato del codigo
- SEO basico con metadatos dinamicos en la pagina de validacion
- Diseno responsive para movil y escritorio

## Estructura

- `app/page.tsx`: Inicio con buscador de certificados
- `app/verificar/[codigo]/page.tsx`: Validacion dinamica por codigo
- `components/SearchForm.tsx`: Formulario con validacion en tiempo real
- `components/CertificateStatusCard.tsx`: Tarjeta de resultado valido/invalido
- `components/CopyCodeButton.tsx`: Copiado del codigo al portapapeles
- `lib/certificados.ts`: Utilidades de lectura y normalizacion
- `data/certificados.json`: Base de datos simulada

## Ejecutar en local

1. Instalar dependencias:

```bash
npm install
```

2. Ejecutar en desarrollo:

```bash
npm run dev
```

3. Abrir en navegador:

```text
http://localhost:3000
```

4. Compilar para produccion:

```bash
npm run build
npm run start
```

## Formato de QR

Cada certificado debe apuntar a esta URL:

```text
https://tudominio.com/verificar/CERT-001
```

## QR desde movil (importante)

Para que el QR funcione al escanear desde el telefono, la URL debe ser publica (no `localhost`).

1. Crea un archivo `.env.local` en la raiz del proyecto.
2. Define tu dominio real:

```bash
NEXT_PUBLIC_APP_URL=https://tudominio.com
```

En desarrollo local, si usas `localhost`, el QR solo abrira en la misma maquina.

## Despliegue en Vercel

1. Subir el repositorio a GitHub.
2. En Vercel, crear un nuevo proyecto e importar el repositorio.
3. Framework preset: Next.js (deteccion automatica).
4. Build command: `npm run build`.
5. Output: automatico de Next.js.
6. Deploy.

No se requieren variables de entorno para esta version con JSON local.

## Escalabilidad sugerida

- Migrar `data/certificados.json` a una base de datos (PostgreSQL, MySQL o MongoDB).
- Crear un endpoint de administracion para emitir certificados.
- Registrar auditoria de consultas para trazabilidad.
- Firmar digitalmente metadatos de certificados para mayor seguridad.
