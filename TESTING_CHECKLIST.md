# 🧪 Checklist de Testing - Portal de Prácticas

## 📋 Antes de Empezar
- [ ] MongoDB está corriendo (`mongod` or MongoDB Compass)
- [ ] Base de datos está limpia (ejecutaste `node scripts/cleanDatabase.js`)
- [ ] Servidor Node está iniciado (`npm start` en la carpeta server)
- [ ] Cliente React está iniciado (`npm start` en la carpeta client)
- [ ] Abriste la consola del navegador (F12) para ver errores

---

## 🔐 PRUEBAS DE AUTENTICACIÓN

### Registro de Estudiante
1. Ve a `http://localhost:3000/register-student`
2. Completa el formulario con datos válidos:
   - Nombre: `Juan`
   - Apellidos: `Pérez`
   - RUT: `12345678-9`
   - Teléfono: `+56912345678`
   - Universidad: `Universidad de Chile`
   - Carrera: `Ingeniería en Computación`
   - Ciudad: `Santiago`
   - Email: `juan@test.com`
   - Contraseña: `Test123!`
3. Haz clic en "Crear mi cuenta"
4. ✅ **Esperado:** Alert "¡Cuenta de estudiante creada!" y redirige a login

**Verificación en MongoDB:**
```javascript
db.students.findOne({email: "juan@test.com"})
// Debe contener:
// - firstName: "Juan" (NO "nombre")
// - lastName: "Pérez" (NO "apellidos")
// - studentRUT: "12345678-9" (NO "rut")
// - career: "Ingeniería en Computación" (NO "carrera")
// - university: "Universidad de Chile" (NO "universidad")
// - role: "student"
```

### Registro de Empresa
1. Ve a `http://localhost:3000/register-company`
2. Completa el formulario:
   - Nombre: `Tech Solutions Inc`
   - RUT: `987654321-0`
   - Rubro: `Tecnología`
   - Email: `empresa@test.com`
   - Contraseña: `Test123!`
3. Haz clic en "Crear Cuenta Empresa"
4. ✅ **Esperado:** Alert "¡Cuenta de empresa creada con éxito!" y redirige a login

**Verificación en MongoDB:**
```javascript
db.companies.findOne({email: "empresa@test.com"})
// Debe contener:
// - companyName: "Tech Solutions Inc" (NO "nombreEmpresa")
// - companyRUT: "987654321-0" (NO "rutEmpresa")
// - industry: "Tecnología" (NO "rubro")
// - role: "company"
```

### Login Estudiante
1. Ve a `http://localhost:3000/login`
2. Lado izquierdo, ingresa credenciales de estudiante:
   - Email: `juan@test.com`
   - Contraseña: `Test123!`
3. Haz clic en "Entrar como Estudiante"
4. ✅ **Esperado:** Alert "¡Bienvenido, Juan!" y redirige a `/home-student`
5. ✅ Verifica localStorage:
   ```javascript
   // Abre DevTools (F12) → Console
   localStorage.getItem('userName')  // Debe retornar "Juan"
   localStorage.getItem('role')      // Debe retornar "student"
   localStorage.getItem('token')     // Debe tener un valor
   localStorage.getItem('userId')    // Debe tener un ObjectId
   ```

### Login Empresa
1. Ve a `http://localhost:3000/login`
2. Lado derecho, ingresa credenciales de empresa:
   - Email: `empresa@test.com`
   - Contraseña: `Test123!`
3. Haz clic en "Entrar como Empresa"
4. ✅ **Esperado:** Alert "¡Bienvenido, Tech Solutions Inc!" y redirige a `/home-company`
5. ✅ Verifica localStorage:
   ```javascript
   localStorage.getItem('userName')  // Debe retornar "Tech Solutions Inc"
   localStorage.getItem('role')      // Debe retornar "company"
   ```

---

## 📝 PRUEBAS DE EMPRESA (HomeCompany)

### Dashboard
1. Accede como empresa a `/home-company`
2. Haz clic en "📊 Dashboard"
3. ✅ Debe mostrar:
   - Ofertas Activas: 0 (sin ofertas aún)
   - Postulantes Totales: 0
   - Estado de Cuenta: Activo

### Crear Oferta
1. Haz clic en "➕ Publicar Práctica"
2. Completa el formulario:
   - Cargo: `Desarrollador Junior React`
   - Descripción: `Buscamos desarrolladores junior con experiencia en React`
   - Ubicación: `Santiago`
   - Modalidad: `Híbrido`
   - Remuneración: `$500.000 - $800.000`
   - Requisitos: `React, JavaScript, SQL, Git`
3. Haz clic en "Confirmar Publicación"
4. ✅ **Esperado:** Alert "✅ Oferta publicada con éxito"
5. ✅ Redirige a "Mis Ofertas"

**Verificación en MongoDB:**
```javascript
db.offers.findOne({title: "Desarrollador Junior React"})
// Debe contener:
// - title: "Desarrollador Junior React"
// - description: "..."
// - location: "Santiago"
// - modality: "Híbrido" (NO "modalidad")
// - salary: "$500.000 - $800.000" (NO "salario")
// - requirements: ["React", "JavaScript", "SQL", "Git"] (NO "requerimientos")
// - companyId: ObjectId (NO "empresaId")
// - applicants: []
// - status: "Active"
```

### Ver Mis Ofertas
1. Haz clic en "📁 Mis Ofertas"
2. ✅ Debe mostrar la oferta creada en una tabla con:
   - Título: `Desarrollador Junior React`
   - Modalidad: `Híbrido`
   - Ubicación: `Santiago`
   - Postulantes: `0`
   - Estado: `Activa` (verde)

### Editar Dashboard después de crear oferta
1. Haz clic en "📊 Dashboard"
2. ✅ Debe mostrar:
   - Ofertas Activas: **1** (cambió de 0)
   - Postulantes Totales: **0** (aún sin postulantes)

---

## 🔍 PRUEBAS DE ESTUDIANTE (HomeStudent)

### Explorar Prácticas
1. Accede como estudiante a `/home-student`
2. Haz clic en "🔍 Explorar Prácticas"
3. ✅ Debe mostrar la oferta creada por la empresa en tarjetas con:
   - Título: `Desarrollador Junior React`
   - Modalidad: `Híbrido` (badge verde)
   - Empresa: `Tech Solutions Inc`
   - Descripción
   - Ubicación: `📍 Santiago`
   - Botón: "Postular ahora"

### Postular a Oferta
1. Haz clic en "Postular ahora" en la oferta
2. ✅ **Esperado:** Alert "✅ Postulación enviada con éxito"
3. ✅ Redirige a "Mis Postulaciones"

**Verificación en MongoDB:**
```javascript
db.applications.findOne({studentId: ObjectId("...")})
// Debe contener:
// - offerId: ObjectId (referencia a la oferta) (NO "oferta")
// - studentId: ObjectId (referencia al estudiante) (NO "estudiante")
// - status: "pending" (NO "pendiente")
// - createdAt: ISODate
```

### Ver Mis Postulaciones
1. Haz clic en "📋 Mis Postulaciones"
2. ✅ Debe mostrar en una tabla:
   - Empresa: `Tech Solutions Inc`
   - Práctica: `Desarrollador Junior React`
   - Fecha: (fecha de hoy)
   - Estado: `Pendiente` (amarillo)

### Ver Curriculum Generado
1. Haz clic en "📄 Mi Curriculum"
2. Haz clic en "📄 Ver / Descargar CV"
3. ✅ Se abre en una nueva pestaña con:
   - Nombre: `Juan Pérez`
   - Carrera: `Ingeniería en Computación`
   - Universidad: `Universidad de Chile`
   - Email: `juan@test.com`
   - Secciones vacías (sin resumen, habilidades, etc.)
4. ✅ Botón "🖨️ Imprimir / PDF" funciona

### Editar Perfil
1. Haz clic en "⚙️ Mi Perfil"
2. Completa los campos:
   - **Resumen Profesional:** `Soy un desarrollador apasionado por React y Node.js`
   - **Habilidades:** `React, JavaScript, Node.js, MongoDB, SQL`
   - **Experiencias:**
     ```
     Voluntariado en ONG XYZ (2023)
     Práctica en Empresa ABC (2022)
     ```
   - **Proyectos:**
     ```
     App de gestión de tareas con React
     API REST con Node.js y Express
     ```
3. Haz clic en "💾 Guardar Cambios"
4. ✅ **Esperado:** Alert "✅ Perfil actualizado correctamente"

**Verificación en MongoDB:**
```javascript
db.students.findOne({email: "juan@test.com"})
// Debe contener:
// - summary: "Soy un desarrollador..." (NO "resumen")
// - skills: ["React", "JavaScript", "Node.js", "MongoDB", "SQL"] (NO "habilidades")
// - experience: ["Voluntariado en ONG XYZ (2023)", ...] (NO "experiencias")
// - projects: ["App de gestión de tareas con React", ...] (NO "proyectos")
```

### Ver Curriculum Actualizado
1. Ve a "Mi Curriculum" nuevamente
2. Haz clic en "Ver / Descargar CV"
3. ✅ Ahora debe mostrar:
   - Resumen Profesional: Soy un desarrollador...
   - Habilidades Técnicas: Badges con React, JavaScript, etc.
   - Experiencia y Voluntariado: Lista con las dos experiencias
   - Proyectos Destacados: Dos tarjetas con los proyectos

---

## 🤝 PRUEBAS DE INTERACCIÓN (Empresa viendo Postulantes)

### Ver Postulantes
1. Accede como empresa
2. Ve a "📁 Mis Ofertas"
3. Haz clic en el número `1` (postulantes) o en el título de la oferta
4. ✅ Debe mostrar una tabla con:
   - Nombre: `Juan Pérez`
   - Email: `juan@test.com`
   - Carrera: `Ingeniería en Computación`
   - Universidad: `Universidad de Chile`
   - Estado: `Pendiente` (amarillo)
   - Botones: "📄 Ver CV", "✓ Aceptar", "✕ Rechazar"

### Ver CV del Postulante
1. Haz clic en "📄 Ver CV"
2. ✅ Se abre en nueva pestaña mostrando el CV del estudiante con:
   - Nombre: Juan Pérez
   - Resumen Profesional
   - Habilidades Técnicas (badges)
   - Experiencia y Voluntariado
   - Proyectos Destacados

### Aceptar Postulante
1. Regresa a la tabla de postulantes
2. Haz clic en "✓ Aceptar"
3. ✅ **Esperado:** Alert "✅ Postulante aceptado"
4. ✅ El estado en la tabla cambia a `Aceptado` (verde)
5. ✅ Los botones Aceptar/Rechazar desaparecen

**Verificación en MongoDB:**
```javascript
db.applications.findOne({studentId: ObjectId("...")})
// status debe cambiar de "pending" a "accepted"
```

### Rechazar Postulante (con nuevo registro)
1. Crea otro estudiante y postula nuevamente
2. En la empresa, haz clic en "✕ Rechazar"
3. ✅ **Esperado:** Alert "✅ Postulante rechazado"
4. ✅ El estado en la tabla cambia a `Rechazado` (rojo)

**Verificación en MongoDB:**
```javascript
db.applications.findOne({status: "rejected"})
// Debe existir un documento con status: "rejected"
```

---

## 🔴 PRUEBAS DE ERRORES (Casos Negativos)

### Credenciales Incorrectas
1. Ve a login
2. Intenta con email/contraseña incorrectos
3. ✅ Debe mostrar alert con mensaje de error

### Acceso sin Token
1. Borra el token de localStorage en DevTools:
   ```javascript
   localStorage.removeItem('token')
   ```
2. Intenta acceder directamente a `/home-student`
3. ✅ Debe redirigir automáticamente a `/login`

### Rol Incorrecto
1. Cambia el rol en localStorage a algo diferente:
   ```javascript
   localStorage.setItem('role', 'admin')
   ```
2. Intenta acceder a `/home-student`
3. ✅ Debe redirigir a `/login`

### Servidor Apagado
1. Detén el servidor Node
2. Intenta hacer login
3. ✅ Debe mostrar alert "No se pudo conectar con el servidor"

---

## 📱 PRUEBAS DE RESPONSIVE (Opcional)

1. Abre DevTools (F12)
2. Activa el "Device Toolbar" (Ctrl+Shift+M)
3. Prueba en diferentes tamaños:
   - 320px (teléfono pequeño)
   - 768px (tablet)
   - 1024px (laptop)
4. ✅ Verifica que no haya overflow y los elementos se adapten

---

## ✅ CHECKLIST FINAL

- [ ] Base de datos limpiada
- [ ] Servidor inició sin errores
- [ ] Cliente inició sin errores
- [ ] Registro de estudiante funcionó
- [ ] Registro de empresa funcionó
- [ ] Login de estudiante funcionó
- [ ] Login de empresa funcionó
- [ ] Crear oferta funcionó
- [ ] Campos en inglés en MongoDB para oferta
- [ ] Explorar prácticas muestra la oferta
- [ ] Postulación funcionó
- [ ] Campos en inglés en MongoDB para application (offerId, studentId, status: 'pending')
- [ ] Editar perfil funcionó
- [ ] CV actualizado con los nuevos datos
- [ ] Empresa vio postulantes correctamente
- [ ] Aceptar/Rechazar postulante funcionó
- [ ] Estados en inglés (pending/accepted/rejected)
- [ ] Sin errores en consola del navegador
- [ ] Sin errores en logs del servidor

---

## 🐛 Si Algo Falla

### Error: "Cannot read property 'firstName' of undefined"
- Verifica que el servidor está usando el modelo Student actualizado
- Reinicia el servidor: `npm start`

### Error: "status is not a valid enum value"
- Verifica que el frontend envía 'pending', 'accepted' o 'rejected' (NO español)
- Revisa HomeCompany.tsx línea donde llamamos a `handleCambiarEstado`

### La oferta no aparece en "Explorar Prácticas"
- Verifica que el servidor devuelve la oferta con populate de companyId
- Abre DevTools → Network → verifica la respuesta de `/api/offers`

### El CV está vacío
- Verifica que guardaste el perfil correctamente
- Abre DevTools → Network → verifica la respuesta de `/api/auth/update-profile/:id`
- Revisa MongoDB que el estudiante tiene los campos summary, skills, experience, projects

---

**¡Listo para probar! 🚀**
