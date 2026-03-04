# 💈 4299 Barber - Sistema de Reservas y Gestión

Una aplicación web Single Page Application (SPA) moderna y reactiva diseñada para la gestión integral de una barbería. Permite a los clientes agendar sus turnos de forma intuitiva, verificando disponibilidad en tiempo real, y ofrece un panel de administración seguro para que los barberos gestionen su agenda y se comuniquen con los clientes.

## ✨ Características Principales

### 👤 Para el Cliente (Landing Page)
* **Reserva Inteligente:** Flujo de 4 pasos para seleccionar Barbero, Servicio, Fecha/Hora y Datos personales.
* **Disponibilidad en Tiempo Real:** El sistema consulta la base de datos para bloquear automáticamente los horarios ya reservados.
* **Lógica de Negocio Integrada:** Bloqueo automático de días no laborables (Domingos y Lunes) y validación de fechas pasadas.
* **Catálogo de Servicios:** Visualización clara de los servicios ofrecidos con su respectiva duración y precio estimado.
* **Confirmación por Email:** El cliente recibe un comprobante estético con los detalles del turno, precio y link directo a Google Maps.

### 🔒 Para el Administrador (Dashboard)
* **Autenticación Segura:** Acceso restringido mediante Firebase Authentication.
* **Panel de Estadísticas:** Tarjetas KPI con el resumen del día (Turnos totales, turnos para hoy y bloqueos manuales).
* **Gestión de Agenda:** Visualización de todos los turnos ordenados cronológicamente con formato de fecha local (DD/MM/YYYY).
* **Bloqueos Manuales:** Posibilidad de registrar turnos presenciales o telefónicos que impactan y bloquean instantáneamente la disponibilidad en la web pública.
* **Integración con WhatsApp:** Generación de enlaces dinámicos con mensajes pre-armados para enviar recordatorios a los clientes con un solo clic.
* **Notificaciones UI:** Feedback visual moderno mediante `react-hot-toast` para todas las acciones (crear, borrar, errores).
* **Notificaciones Automatizadas:** Sistema de Cloud Functions que alerta al barbero vía email ante cada nueva reserva.

### 🛡️ Seguridad y Escalabilidad

* **Gestión de Secretos:** Credenciales sensibles (Gmail, Firebase) protegidas mediante Firebase Secrets y Variables de Entorno.
* **Infraestructura Serverless:** Lógica de notificaciones ejecutada en el backend mediante Firebase Cloud Functions (2nd Gen).

## 🛠️ Tecnologías Utilizadas

* **Frontend:** React 18, Vite.
* **Estilos:** Tailwind CSS v4.
* **Enrutamiento:** React Router Dom.
* **Backend as a Service (BaaS):** Firebase (Firestore Database & Authentication, Firestore, Cloud Functions).
* **Alertas:** Nodemailer (Backend) y React Hot Toast.

##  👨‍💻 Desarrollo

Desarrollado como solución integral de software para la gestión de agendas y optimización del tiempo en negocios físicos.