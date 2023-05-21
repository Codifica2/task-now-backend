# Instalación

* Clonar el repositorio
* Ejecutar el comando `npm install` en el directorio raíz de la aplicación
* Crear un archivo .env en la raíz del proyecto que contenga los siguientes llaves:
  - PORT="3001"
  - TOKEN_SECRET=<cualquier string aleatorio>
  - MONGODB_URI="mongodb+srv://<username>:<password>@task-now.0fcpyou.mongodb.net/task-now?retryWrites=true&w=majority"
  (para proteger nuestra base de datos, pedir credenciales a algún miembro del equipo si se quiere probar la aplicación)

# Ejecución
* Ejecutar el comando `npm run dev` para ejecutar la aplicación en el puerto 3001

# Pruebas
* Ejecutar el comando `npm test` para ejecutar las tareas creadas
