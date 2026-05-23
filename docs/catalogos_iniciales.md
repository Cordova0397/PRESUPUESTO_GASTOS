# Catálogos iniciales

Este documento describe los centros de costo y conceptos de gasto que se cargan como catálogo inicial del MVP de PRESUPUESTO GASTOS.

Los datos se cargan mediante el script idempotente `scripts/seed_initial_catalogs.py`, ejecutable con `seed_catalogs.bat`.

Los códigos (`code`) son claves funcionales únicas. Se usan para:
- Identificar registros en el seed.
- Futuras referencias en integraciones o configuraciones.
- Asociar conceptos a su centro de costo correcto.

Los montos planificados y los gastos reales **no se cargan** en esta tarea. Se registrarán desde las pantallas del MVP.

## Centros de costo

| sort_order | code | name | color |
| --- | --- | --- | --- |
| 10 | `PROD_OP` | Centro de Costos de Producción / Operaciones | #dc2626 |
| 20 | `VENTAS` | Centro de Costos de Ventas | #15803d |
| 30 | `MARKETING` | Centro de Costos de Marketing | #15803d |
| 40 | `ADM_GEN` | Centro de Costos Administrativos (Generales) | #be185d |
| 50 | `SERV_SOP` | Centro de Costos de Servicios / Soporte | #dc2626 |

Total: **5 centros de costo**.

## Conceptos de gasto por centro

### PROD_OP — Producción / Operaciones

| sort_order | code | name |
| --- | --- | --- |
| 10 | `SALARIOS` | Salarios |
| 20 | `BENEFICIOS` | Beneficios |

### VENTAS — Ventas

| sort_order | code | name |
| --- | --- | --- |
| 10 | `SUELDO_VENDEDORES` | Sueldo Vendedores |
| 20 | `COMISIONES` | Comisiones |
| 30 | `VIATICOS` | Viáticos |
| 40 | `CAPACITACIONES` | Capacitaciones |
| 50 | `MOVILIDAD_COMERCIAL` | Movilidad Comercial |
| 60 | `FACEBOOK_ADS` | Facebook Ads |
| 70 | `TELEFONIA_VENTAS` | Telefonía Ventas |
| 80 | `GOOGLE_ADS` | Google Ads |

### MARKETING — Marketing

| sort_order | code | name |
| --- | --- | --- |
| 10 | `SUELDO_VENDEDORES` | Sueldo Vendedores |
| 20 | `PRODUCCION_AUDIOVISUAL` | Producción audiovisual |
| 30 | `MERCHANDISING` | Merchandising |
| 40 | `EVENTOS` | Eventos |
| 50 | `REGALOS_CORPORATIVOS` | Regalos Corporativos |
| 60 | `FACEBOOK_ADS` | Facebook Ads |
| 70 | `TELEFONIA_COMERCIAL` | Telefonía Comercial |

### ADM_GEN — Administrativos (Generales)

| sort_order | code | name |
| --- | --- | --- |
| 10 | `SUELDO_ADMINISTRATIVO` | Sueldo Administrativo |
| 20 | `SUELDO_GERENCIA` | Sueldo Gerencia |
| 30 | `SUELDO_CONTABILIDAD` | Sueldo Contabilidad |
| 40 | `RRHH` | RRHH |
| 50 | `INTERNET` | Internet |
| 60 | `TELEFONIA` | Telefonía |
| 70 | `AGUA` | Agua |
| 80 | `LUZ` | Luz |
| 90 | `ALQUILER_LOCAL` | Alquiler Local |
| 100 | `VIGILANCIA` | Vigilancia |
| 110 | `UTILES_OFICINA` | Útiles de Oficina |
| 120 | `PAPELERIA` | Papelería |
| 130 | `IMPRESIONES` | Impresiones |
| 140 | `LICENCIAS_SOFTWARE` | Licencias software |
| 150 | `SEGUROS` | Seguros |
| 160 | `ASESORIA_LEGAL` | Asesoría legal |
| 170 | `IMPUESTOS` | Impuestos |

### SERV_SOP — Servicios / Soporte

| sort_order | code | name |
| --- | --- | --- |
| 10 | `SUELDO_OPERATIVOS` | Sueldo Operativos |
| 20 | `CURSOS_APRENDIZAJE` | Cursos de aprendizaje |
| 30 | `COSTOS_VIAJES_APRENDIZAJE` | Costos de viajes de aprendizaje |

## Resumen de conteos

| Tabla | Registros esperados |
| --- | --- |
| `cost_centers` | 5 |
| `expense_concepts` | 37 |
| `planned_expenses` | 0 (no se cargan) |
| `actual_expenses` | 0 (no se cargan) |

## Notas técnicas

- El seed es idempotente. Se puede ejecutar múltiples veces sin duplicar registros.
- Si el registro existe por su `code` clave, se actualiza `name`, `color`, `sort_order` e `is_active`.
- Los timestamps `created_at` y `updated_at` usan la zona horaria funcional `America/Lima`.
- Los datos se almacenan en MySQL con charset `utf8mb4` para soportar español con tildes y caracteres especiales.
- Para ejecutar el seed: `seed_catalogs.bat` (requiere MySQL encendido y `DATABASE_URL` correcto en `backend/.env`).
- Prerequisito: `db_upgrade.bat` debe haberse ejecutado para crear las tablas.
