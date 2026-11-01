@contact @regression
Feature: Formulario de contacto
  Como visitante interesado en los servicios de Pack Express
  Quiero enviar una consulta por el formulario de contacto
  Para recibir una respuesta del equipo comercial

  Background:
    Given el visitante navega a la home
    And el visitante hace scroll hasta el formulario de contacto

  @critical @validation
  Scenario: Enviar el formulario vacío muestra todos los errores requeridos
    When el visitante envía el formulario de contacto sin completar nada
    Then debe verse el error "Requerido" en el campo "nombre"
    And debe verse el error "Requerido" en el campo "telefono"
    And debe verse el error "Email inválido" en el campo "email"
    And debe verse el error "Seleccioná un asunto" en el campo "asunto"
    And debe verse el error "Mínimo 10 caracteres" en el campo "mensaje"

  # Regresión de BUG-APP-004 (corregido): sin `noValidate` en el <form>, la
  # validación nativa HTML5 interceptaba el submit y el mensaje propio
  # "Email inválido" nunca se renderizaba.
  @validation
  Scenario Outline: Email inválido bloquea el envío
    When el visitante completa el formulario de contacto con email "<email>"
    And el visitante envía el formulario de contacto
    Then debe verse el error "Email inválido" en el campo "email"

    Examples:
      | email                    |
      | no-es-email               |
      | falta-arroba.com          |
      | @sin-usuario.com          |

  @boundary
  Scenario: Mensaje de 9 caracteres (boundary inválido) es rechazado
    When el visitante completa el formulario de contacto con un mensaje de 9 caracteres
    And el visitante envía el formulario de contacto
    Then debe verse el error "Mínimo 10 caracteres" en el campo "mensaje"

  @edge-case
  Scenario: El botón de enviar se deshabilita mientras se procesa el envío
    Given el visitante completa el formulario de contacto con datos válidos
    When el visitante envía el formulario de contacto
    Then el botón de enviar debe quedar deshabilitado durante el envío

  # Regresión de BUG-APP-002 (corregido): los errores de red/servidor se
  # mostraban con alert() nativo (bloqueante, sin estilo, poco accesible).
  # Ahora se renderizan inline con role="alert" dentro del formulario.
  @negative
  Scenario: Un fallo del servidor muestra un error inline, no un alert nativo
    Given la API de contacto va a fallar
    And el visitante completa el formulario de contacto con datos válidos
    When el visitante envía el formulario de contacto
    Then debe verse un error inline en el formulario de contacto

  @happy-path @requires-backend
  Scenario: Enviar el formulario con datos válidos muestra confirmación
    Given el visitante completa el formulario de contacto con datos válidos
    When el visitante envía el formulario de contacto
    Then debe verse el mensaje "¡Mensaje enviado!"
