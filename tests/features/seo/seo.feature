@seo @regression
Feature: SEO técnico
  Como responsable de marketing/SEO
  Quiero que la home exponga los metadatos correctos
  Para que los buscadores indexen la página apropiadamente

  Background:
    Given el visitante navega a la home

  Scenario: Meta tags esenciales presentes
    Then debe existir un meta description no vacío
    And debe existir un link canonical
    And debe existir el meta "og:title"

  Scenario: JSON-LD estructurado es válido
    Then debe existir al menos un script JSON-LD parseable

  # Regresión de BUG-APP-001 (corregido): montar <SEO /> junto al fallback
  # estático de index.html duplicaba los tags, porque react-helmet-async con
  # React 19 usa el hoisting nativo, que no deduplica contra el HTML servido.
  Scenario: Los meta tags no están duplicados tras la hidratación
    Then no debe haber meta tags ni canonical duplicados
