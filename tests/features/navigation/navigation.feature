@navigation @regression
Feature: Navegación global
  Como visitante de la landing
  Quiero navegar entre secciones y abrir el cotizador desde distintos puntos
  Para poder acceder rápido a la información que busco

  Background:
    Given el visitante navega a la home

  @critical
  Scenario: Abrir el cotizador desde el botón del Navbar
    When el visitante hace click en "Cotizar" del navbar
    Then el modal de cotización debe estar abierto

  @critical
  Scenario: Abrir el cotizador desde el botón del Hero
    When el visitante hace click en "Cotizar envío" del Hero
    Then el modal de cotización debe estar abierto

  Scenario: Abrir el cotizador directamente vía hash #tarifas
    Given el visitante navega a la home con hash "#tarifas"
    Then el modal de cotización debe estar abierto

  # Regresión de BUG-APP-008 (corregido): navegar a #tarifas ESTANDO ya en la
  # home es una navegación de solo-hash — no remonta React, así que el estado
  # inicial no alcanzaba y el link del footer quedaba muerto.
  Scenario: El link "Tarifas" del footer abre el cotizador
    When el visitante hace scroll hasta el final de la página
    And el visitante hace click en el link "Tarifas" del footer
    Then el modal de cotización debe estar abierto

  Scenario: El link "Tarifas" del footer vuelve a funcionar tras cerrar el modal
    When el visitante hace scroll hasta el final de la página
    And el visitante hace click en el link "Tarifas" del footer
    And el visitante cierra el cotizador con el botón de cerrar
    And el visitante hace click en el link "Tarifas" del footer
    Then el modal de cotización debe estar abierto

  # Regresión de BUG-APP-007 (corregido): el PromoBanner (z-60) tapaba el
  # botón "Cerrar menú" del drawer (z-40) e interceptaba el tap, dejando el
  # menú imposible de cerrar desde la X. El drawer pasó a z-[70].
  @mobile
  Scenario: El menú móvil abre y cierra correctamente
    Given el visitante usa un viewport móvil
    When el visitante abre el menú móvil
    Then el menú móvil debe mostrar el botón de cerrar
    When el visitante cierra el menú móvil
    Then el botón de cerrar del menú móvil ya no debe estar visible

  Scenario: Toggle de tema persiste tras recargar
    Given el visitante anota el tema actual
    When el visitante cambia el tema
    Then el tema visual debe haber cambiado
    When el visitante recarga la página
    Then el tema debe seguir siendo el mismo que tras el cambio

  Scenario: Una ruta inexistente muestra la página 404
    Given el visitante navega a la ruta inválida "/esta-ruta-no-existe"
    Then debe verse la página de "no encontrado"
