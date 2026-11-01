@docs @regression
Feature: Documentos y requisitos
  Como visitante que necesita cumplir requisitos de envío
  Quiero acceder a documentos oficiales y requisitos
  Para preparar correctamente mi envío

  Background:
    Given el visitante navega a la home
    And el visitante hace scroll hasta la sección de documentos

  Scenario: El link de descarga de la Declaración Jurada apunta a un archivo existente
    Then el link "Descargar" de "Declaración Jurada" debe responder 200

  Scenario: El link del documento de la Resolución URSEC apunta a un archivo existente
    Then el link "Ver documento" de "Resolución N° 148/2023" debe responder 200

  @modal
  Scenario: Abrir el modal de Requisitos Courier
    When el visitante hace click en "Ver requisitos" de "Requisitos Courier"
    Then el modal legal debe estar abierto con el título "Políticas de envío paquetería"

  @modal
  Scenario: Abrir el modal de Artículos Prohibidos
    When el visitante hace click en "Consultar" de "Artículos Prohibidos"
    Then el modal legal debe estar abierto con el título "Objetos restringidos para envíos"
