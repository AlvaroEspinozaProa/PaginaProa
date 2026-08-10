# Guía de Trabajo - Página Proa: Dinamismo en Pasantías

Hola equipo. Estuve auditando el código de su repositorio, prestándole especial atención a la carpeta Front/JS y a cómo están estructurando los archivos.

Primero, quiero destacar el nivel de arquitectura que están manejando. Haber decidido separar la lógica en servicios (pasantias_service.js) y controladores (pasantias_controller.js) es aplicar un patrón de diseño profesional. Están trabajando con Supabase de una forma muy prolija y escalable.

El desafío para esta etapa es hacer que el módulo de Pasantías deje de ser un diseño estático y pase a ser completamente funcional, conectando esa estructura que armaron con la base de datos real.

Para avanzar ordenados y no pisarse el código, les dejo esta división de tareas:

### Equipo 1: La conexión a la base (El Servicio)
El archivo pasantias_service.js tiene una sola responsabilidad: hablar con Supabase. No debe tocar nada del HTML ni mezclar cosas de la vista.

1. Creen y exporten una función asíncrona (async) que se encargue de obtener las pasantías.
2. Adentro de esa función, armen la consulta a Supabase (el select) apuntando a la tabla correspondiente.
3. Creen una segunda función asíncrona que reciba un objeto con datos como parámetro y se encargue de hacer el insert en Supabase para crear una pasantía nueva.
4. Asegúrense de envolver las consultas en bloques try/catch para poder ver en la consola si la base de datos rechaza la conexión.

### Equipo 2: La interfaz y el DOM (El Controlador)
El archivo pasantias_controller.js es el puente. Se encarga de pedirle los datos al servicio y dibujarlos en el pasantias.html.

1. Importen las funciones del servicio que armó el Equipo 1 usando la sintaxis de módulos (import).
2. Armen una función principal para renderizar la pantalla. Esta función tiene que ejecutar la llamada al servicio, recibir el array con los datos, recorrerlo (pueden usar un forEach) y usar .innerHTML para inyectar las tarjetas HTML en el contenedor vacío.
3. Capturen el evento submit del formulario de carga. Cuando el usuario intente subir una nueva pasantía, lean los valores de los inputs y mándenselos a la función de guardado del servicio. 

### Equipo 3: Control de Acceso (Seguridad de la vista)
Tenemos que asegurarnos de que la página reaccione dependiendo de quién la está mirando, reciclando la lógica que ya tienen en auth.js.

1. Al cargar la página de pasantías, el sistema debe verificar si hay un usuario logueado.
2. Si el usuario es un visitante anónimo, el botón o el formulario para "Agregar Pasantía" tiene que estar oculto por defecto desde JavaScript.
3. Si está logueado, recién ahí se le remueve la clase oculta. Esto es fundamental para evitar que cualquiera nos llene la base de datos con información falsa.

### Objetivo de esta etapa
La maqueta visual ya la tienen resuelta. La meta de esta fase es que cualquier alumno del colegio pueda entrar con su cuenta, ir a la sección, cargar su experiencia en el formulario y que automáticamente la tarjeta aparezca dibujada en la pantalla leyendo directamente desde Supabase.

Si se traban, con las importaciones de los módulos o la consola les tira algún error de CORS, me avisan y lo destrabamos en la compu.