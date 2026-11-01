@legal @regression
Feature: Contenido legal
  Como visitante interesado en las políticas del servicio
  Quiero consultar los Términos y Condiciones
  Para entender mis derechos y obligaciones al usar el servicio

  Background:
    Given el visitante navega a la home
    And el visitante hace scroll hasta el footer

  @modal
  Scenario: Abrir Términos y Condiciones desde el footer
    When el visitante hace click en "Términos y Condiciones" del footer
    Then el modal legal debe estar abierto

  @modal
  Scenario: Cerrar el modal legal con Escape
    Given el visitante hace click en "Términos y Condiciones" del footer
    When el visitante presiona Escape
    Then el modal legal no debe estar visible

  # Regresión de BUG-APP-005 (corregido): el LegalModal tenía el mismo
  # backdrop inalcanzable que el Cotizador — el contenedor centrador (z-10)
  # tapaba al backdrop que llevaba el onClick de cierre.
  @modal
  Scenario: Cerrar el modal legal clickeando fuera
    Given el visitante hace click en "Términos y Condiciones" del footer
    When el visitante clickea fuera del modal legal
    Then el modal legal no debe estar visible
