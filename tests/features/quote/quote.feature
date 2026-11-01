@quote @regression
Feature: Cotizador de envíos
  Como visitante interesado en enviar un paquete
  Quiero cotizar mi envío por país y peso
  Para conocer el precio antes de contactar a Pack Express

  Background:
    Given el visitante navega a la home
    And el visitante abre el cotizador

  @critical
  Scenario: Cerrar el cotizador con el botón X
    When el visitante cierra el cotizador con el botón de cerrar
    Then el modal de cotización no debe estar visible

  Scenario: Cerrar el cotizador clickeando fuera del modal
    When el visitante clickea fuera del modal de cotización
    Then el modal de cotización no debe estar visible

  Scenario: Cerrar el cotizador con la tecla Escape
    When el visitante presiona Escape
    Then el modal de cotización no debe estar visible

  @search
  Scenario: Buscar un país filtra la lista correctamente
    When el visitante busca el país "arge" en el selector
    Then la opción "Argentina" debe estar visible en la lista

  @negative @search
  Scenario: Buscar un país inexistente muestra "sin resultados"
    When el visitante busca el país "zzzzznoexiste" en el selector
    Then debe verse el texto "Sin resultados"

  # Destinos suspendidos (SUSPENDED_COUNTRIES en src/lib/zones.js): si no se
  # puede enviar, tampoco se debe poder cotizar. Al reactivar un destino, este
  # escenario debe actualizarse o eliminarse.
  @negative @search
  Scenario: Un destino suspendido no se ofrece en el selector
    When el visitante busca el país "estados" en el selector
    Then debe verse el texto "Sin resultados"

  Scenario: Los demás países de la misma región siguen disponibles
    When el visitante busca el país "canad" en el selector
    Then la opción "Canadá" debe estar visible en la lista

  @happy-path
  Scenario: Seleccionar un país lo deja marcado en el combobox
    When el visitante selecciona el país "Cuba"
    Then el selector de país debe mostrar "Cuba"

  @validation
  Scenario: El botón "Ver precio" está deshabilitado sin datos completos
    Then el botón de cotizar debe estar deshabilitado

  @ui
  Scenario: Cambiar el tipo de envío actualiza la selección visual
    When el visitante selecciona el tipo de envío "Paquetería"
    And el visitante selecciona el tipo de envío "Documentos"
    Then el tipo de envío "Documentos" debe estar marcado como seleccionado
