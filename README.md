# Sistemas distribuidos: Tarea 2

En esta tarea se desarrolla el uso de Apache Kafka para un gremio de sopaipilleros en crecimiento.

# Inicio
Para iniciar los contenedores, se debe clonar el repositorio y ejecutar el comando:

    docker compose up --build
Y para registrar miembros dentro del gremio, mediante la API Postman, se debe seguir el siguiente formato JSON mediante el body. Estas se entregan a la ruta http://localhost:3000/register
 
    {
        "name": "xxxx",
        "lastname": "yyyy",
        "rut": "abcdefg-h",
        "email": "xyxyxy@mail.com",
        "patent": "ZZZ-Y",
        "premium": 1 o 0
    }      
E igualmente, para registrar las ventas, se sigue el formato JSON, siguiendo la ruta http://localhost:3000/sale y entregando en body:
 
    {
        "client": "xxxx",
        "quantity": "Y",
        "remainingStock": "Z",
        "location": "xyxyxy",
        "patent": "ZZZ-Y"
    }     
# Video e informe
En el siguiente drive se encuentra el acceso para el vídeo y el informe solicitados para la tarea.
[Drive con vídeo e informe](https://drive.google.com/drive/folders/13ae4S8kzFPZcJJt-T6sAUcVFgfYB-o2I?usp=sharing)
