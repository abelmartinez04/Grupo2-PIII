# Grupo 2. Programacion III

### Proyecto propuesta sistema de Farmacia

- Integrantes

> **Emmanuel Alexander Garcia Luciano**  
>  Matrícula: `2024-0056`

> **Wilker José Capellan Coronado**  
>  Matrícula: `2024-0217`

> **Robert Gabriel Núñez Matías**  
>  Matrícula: `2024-0220`

> **Abel Eduardo Martínez Robles**  
>  Matrícula: `2024-0227`

>**Franchelys Batista meran**  
>  Matrícula: `2024-0239`

>**Gabriel Sánchez Reynoso**  
>  Matrícula: `2024-0269`

---

# Instrucciones para ejecutar el proyecto

_Requisitos_:

- MySQL
- JS
- Nodes.js
- Dotenv

## Guía completa para configurar y ejecutar el proyecto en tu máquina local.

## **1.** Clonar el repositorio

Clona el proyecto usando **GitHub Desktop**

### **2.** Crear la base de datos en MySQL

Abre tu consola de MySQL o MySQL Workbench y ejecuta los archivos: ```farmacia_db.sql``` e ```insertions``` para crear la base de datos e insertar algunos medicamentos principales para el inventario.

### **3.** Instalar Node.js
Descarga e instala Node.js:
- https://nodejs.org/dist/v24.10.0/node-v24.10.0-x64.msi

- o en la pagina oficial: https://nodejs.org

Verifica la instalación:
```
node -v
npm -v
```

### **4.** Inicializar el proyecto

En la terminal del proyecto, ejecuta:
```
npm init -y
```

### **5.** Instalar dependencias
Instala las librerías necesarias:
```
npm install mysql2 dotenv
npm install express ejs
```
> ⚠️En ```package.json``` revisar esta linea (si aparece con 'commonjs' en vez de 'module'):
```"type": "commonjs",```
> cambiar por
```"type": "module",```

### **6.** Crear archivo .env
Crea un archivo ```.env``` en la raíz del proyecto o en ```/config``` con tus datos de conexión:
```
HOST=localhost
USER=root
PASS=MiContraseña
DB=farmacia_db
```
> Cambiar "MiContraseña" por la contraseña real de mysql

### **7.** Probar la conexión a la base de datos

Ejecuta el script de conexión:
```
node config/db.js
```
Si todo está correcto, verás:
```
✅ Conexión exitosa a la base de datos
```
