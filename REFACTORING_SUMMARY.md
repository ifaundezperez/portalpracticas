# 📋 Resumen del Refactoring: Español → Inglés

## 🎯 Objetivo
Cambiar todos los nombres de variables, campos de base de datos y referencias de código del español al inglés, manteniendo los comentarios y textos mostrados al usuario en español.

---

## ✅ Cambios Completados

### 🗄️ **BASE DE DATOS (MongoDB Models)**

#### **Student.ts**
```
nombre → firstName
apellidos → lastName
rut → studentRUT
telefono → phone
universidad → university
carrera → career
ciudad → city
rol → role
resumen → summary
habilidades → skills (array)
experiencias → experience (array)
proyectos → projects (array)
fechaInicio → startDate
fechaFin → endDate
```

#### **Company.ts**
```
nombreEmpresa → companyName
rutEmpresa → companyRUT
rubro → industry
rol → role (se mantiene en inglés)
```

#### **Application.ts**
```
oferta → offerId
estudiante → studentId
status: ['pendiente', 'aceptada', 'rechazada'] → ['pending', 'accepted', 'rejected']
ref: 'Estudiante' → ref: 'Student'
```

#### **Offer.ts**
```
Todos los campos están en inglés:
- title, description, location, salary, modality, requirements
- companyId, applicants, status
```

---

### 🔌 **RUTAS DEL SERVIDOR (API Endpoints)**

#### **authRoutes.ts**
- `POST /api/auth/register-student` - Usa firstName, lastName, studentRUT, etc.
- `POST /api/auth/register-company` - Usa companyName, companyRUT, industry
- `POST /api/auth/login-student` - Retorna user.firstName, user.id
- `POST /api/auth/login-company` - Retorna user.companyName, user.id
- `GET /api/auth/student/:id` (antes: `/estudiante/:id`) - Retorna todos los campos en inglés
- `PUT /api/auth/update-profile/:id` (antes: `/actualizar-perfil/:id`) - Espera summary, skills, experience, projects

#### **applicationRoutes.ts**
- `POST /api/applications/postular` - Usa offerId, studentId
- `GET /api/applications/student/:id` - Retorna status en inglés (pending/accepted/rejected)
- `GET /api/applications/oferta/:offerId` - Retorna postulantes con status en inglés
- `PATCH /api/applications/:id/status` - Acepta nuevoEstado en inglés

#### **offerRoutes.ts**
- `POST /api/offers/crear` - Usa title, description, location, salary, modality, requirements, companyId
- `GET /api/offers` - Retorna ofertas con populate de companyId
- `GET /api/offers/empresa/:companyId` - Retorna ofertas de la empresa

---

### 🖥️ **FRONTEND (React Pages)**

#### **Login.tsx**
✅ Usa `data.user.firstName` en lugar de `data.user.nombre`
✅ Usa `data.user.companyName` en lugar de `data.user.nombre`
✅ localStorage.setItem('userName', data.user.firstName/companyName)

#### **RegisterStudent.tsx**
✅ Todos los campos del formulario usan nombres en inglés
✅ Envía firstName, lastName, studentRUT, phone, university, career, city, email, password

#### **RegisterCompany.tsx**
✅ Todos los campos del formulario usan nombres en inglés
✅ Envía companyName, companyRUT, industry, email, password

#### **HomeStudent.tsx**
✅ Fetch a `/api/auth/update-profile/:id` en lugar de `/actualizar-perfil/:id`
✅ Mapea perfilEditable.resumen → summary antes de enviar
✅ Mapea perfilEditable.habilidades → skills (string a array)
✅ Mapea perfilEditable.experiencias → experience
✅ Mapea perfilEditable.proyectos → projects

#### **HomeCompany.tsx**
✅ Usa status enum correcto (pending/accepted/rejected)
✅ Fetch a `/api/applications/oferta/:offerId` para postulantes

#### **CurriculumView.tsx**
✅ Fetch a `/api/auth/student/:id` (antes: `/estudiante/:id`)
✅ Usa todos los campos en inglés (firstName, lastName, career, university, summary, skills, experience, projects)
✅ Variable `estudiante` contiene los datos del estudiante

---

## 🧹 **Próximos Pasos**

### 1️⃣ Limpiar la Base de Datos
Ejecuta el script de limpieza para eliminar documentos antiguos con campos en español:

```bash
cd server
node scripts/cleanDatabase.js
```

Este script eliminará todos los documentos de:
- `students`
- `companies`
- `offers`
- `applications`

**⚠️ Advertencia:** Esto eliminará TODOS los datos. Asegúrate de hacer backup si necesitas los datos antiguos.

### 2️⃣ Reiniciar el Servidor

```bash
cd server
npm start
```

El servidor debe conectarse a MongoDB sin errores de validación de esquema.

### 3️⃣ Probar la Aplicación

1. **Registro de Estudiante:**
   - Ve a `/register-student`
   - Completa el formulario con datos válidos
   - Verifica que el estudiante se cree correctamente en MongoDB

2. **Registro de Empresa:**
   - Ve a `/register-company`
   - Completa el formulario con datos válidos
   - Verifica que la empresa se cree correctamente

3. **Login:**
   - Prueba login de estudiante
   - Prueba login de empresa
   - Verifica que se guarden los datos correctos en localStorage

4. **Crear Oferta (Empresa):**
   - Accede como empresa
   - Crea una nueva oferta con todos los campos
   - Verifica que la oferta aparece en "Mis Ofertas"

5. **Postular (Estudiante):**
   - Accede como estudiante
   - Ve "Explorar Prácticas"
   - Postula a una oferta
   - Verifica que aparece en "Mis Postulaciones" con estado "Pendiente"

6. **Ver Postulantes (Empresa):**
   - Accede como empresa
   - Haz clic en el número de postulantes
   - Verifica que puedas ver los datos del estudiante
   - Prueba aceptar/rechazar postulantes

7. **Ver Curriculum:**
   - Accede como estudiante
   - Ve a "Mi Curriculum"
   - Descarga el PDF

---

## 📊 **Checklist de Validación**

- [ ] Script de limpieza ejecutado exitosamente
- [ ] Servidor reiniciado sin errores
- [ ] Estudiante puede registrarse
- [ ] Empresa puede registrarse
- [ ] Login funciona para ambos roles
- [ ] Crear oferta guarda todos los campos en inglés
- [ ] Postular crea application con status 'pending'
- [ ] Ver CV muestra todos los campos correctamente
- [ ] Cambio de estado de postulante funciona
- [ ] No hay errores en la consola del navegador (F12)
- [ ] No hay errores en los logs del servidor

---

## 🔍 **Verificación de MongoDB**

Para verificar que todo se guardó correctamente, usa MongoDB Compass o mongosh:

```javascript
// Verificar estructura de estudiante
db.students.findOne()
// Debe tener: firstName, lastName, studentRUT, phone, university, career, city, email, role, summary, skills[], experience[], projects[]

// Verificar estructura de empresa
db.companies.findOne()
// Debe tener: companyName, companyRUT, industry, email, role

// Verificar estructura de oferta
db.offers.findOne()
// Debe tener: title, description, location, salary, modality, requirements[], companyId, applicants[], status

// Verificar estructura de aplicación
db.applications.findOne()
// Debe tener: offerId, studentId, status (pending/accepted/rejected), createdAt
```

---

## 📝 **Notas Importantes**

1. **Los comentarios en el código permanecen en español** para facilitar el entendimiento del desarrollador
2. **Los textos mostrados al usuario permanecen en español** (alertas, placeholders, etiquetas)
3. **Solo se cambió la estructura interna** del código y la base de datos
4. **No hay cambios en el CSS o en la lógica de negocio**, solo en los nombres de variables
5. **El localStorage sigue guardando los mismos datos**, pero con referencias a nombres en inglés

---

## 🐛 **Solución de Problemas**

### Error: "Schema hasn't been registered for model"
**Causa:** Los documentos antiguos tienen referencias a modelos con nombres en español
**Solución:** Ejecutar `node scripts/cleanDatabase.js` para eliminar documentos antiguos

### Error: "Cannot read property 'firstName' of undefined"
**Causa:** El API está retornando campos con nombres en español
**Solución:** Verificar que el servidor está usando los modelos actualizados

### El CV no carga
**Causa:** El endpoint GET cambió de `/estudiante/:id` a `/student/:id`
**Solución:** Verificar que CurriculumView.tsx está haciendo fetch a la ruta correcta

---

## ✨ **Beneficios del Refactoring**

✅ **Consistencia:** El código sigue convenciones internacionales de programación
✅ **Mantenimiento:** Más fácil para colaboradores de otros países
✅ **Estándares:** Sigue best practices de la industria (inglés para código)
✅ **Claridad:** Separación clara entre código interno y UI para el usuario
✅ **Escalabilidad:** Más fácil agregar nuevas idiomas en la UI

---

**Fecha del refactoring:** 2026-05-15
**Estado:** ✅ Completado
