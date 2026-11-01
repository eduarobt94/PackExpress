@smoke @regression
Feature: Smoke — disponibilidad básica de la landing
  Como visitante de packexpress.com.uy
  Quiero que la home cargue correctamente
  Para poder confiar en que el sitio está operativo

  Background:
    Given el visitante navega a la home

  @critical
  Scenario: La home carga con título y hero visibles
    Then el título de la página debe contener "Pack Express"
    And el encabezado principal (H1) debe ser visible
    And no deben registrarse errores de consola

  @critical
  Scenario: El navbar está visible y funcional
    Then el navbar debe estar visible con el logo de Pack Express

  Scenario: El footer con datos de contacto está visible al hacer scroll
    When el visitante hace scroll hasta el final de la página
    Then el footer debe mostrar el teléfono "(+598) 93 594 297"
