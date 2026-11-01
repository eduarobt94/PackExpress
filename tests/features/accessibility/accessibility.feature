@accessibility @regression
Feature: Accesibilidad
  Como visitante que depende de tecnología de asistencia o de preferencias
  de accesibilidad del sistema operativo
  Quiero que la landing respete esas preferencias
  Para poder navegarla sin barreras

  Scenario: prefers-reduced-motion suprime transiciones de movimiento
    Given el visitante tiene activada la preferencia de movimiento reducido
    When el visitante navega a la home
    Then las transiciones de color deben seguir activas para dar feedback

  Scenario: El skip-link "Ir al contenido principal" aparece al enfocar con teclado
    Given el visitante navega a la home
    When el visitante presiona Tab desde el inicio de la página
    Then el link "Ir al contenido principal" debe quedar visible

  Scenario: Cada campo del formulario de contacto tiene una etiqueta asociada
    Given el visitante navega a la home
    And el visitante hace scroll hasta el formulario de contacto
    Then los campos nombre, email, teléfono, asunto y mensaje deben tener label accesible
