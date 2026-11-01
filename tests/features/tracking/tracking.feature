@tracking @regression
Feature: Rastreo público de guías
  Como cliente con un envío en curso
  Quiero rastrear mi guía por número
  Para saber en qué estado está mi paquete

  Background:
    Given el visitante navega a la home

  @validation
  Scenario: Buscar sin ingresar número de guía muestra validación y no llama a la API
    When el visitante hace scroll hasta la sección de rastreo
    And el visitante hace click en "Rastrear" sin ingresar ningún número
    Then debe verse el mensaje de validación "Ingresá el número de guía."
    And no debe dispararse ninguna búsqueda contra la API

  @integration @critical
  Scenario: Rastrear desde el input rápido del Hero navega a la sección de rastreo
    When el visitante ingresa la guía "CM000000689PK" en el input rápido del Hero
    Then la sección de rastreo debe quedar visible en pantalla
    And el campo de número de guía debe contener "CM000000689PK"

  @negative @requires-backend
  Scenario: Buscar una guía inexistente muestra un error
    Given el visitante hace scroll hasta la sección de rastreo
    When el visitante busca la guía "GUIA-QA-INEXISTENTE-000"
    Then debe verse un mensaje de error de rastreo
