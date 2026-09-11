import type { ComplianceRule } from "./rule-types.js";

const VERIFIED_AT = "2026-09-10";
const SOURCE_URL =
  "https://www.sec.cl/sitio-web/wp-content/uploads/2021/01/RIC-N10-Instalaciones-de-uso-general.pdf";

export const ric10Rules: ComplianceRule[] = [
  {
    id: "RIC10-5.1.3.3-GENERAL-OMNIPOLAR",
    title: "Protección general de corte omnipolar",
    projectType: "TE1",
    severity: "blocker",
    source: {
      authority: "SEC",
      document: "Pliego Técnico Normativo RIC N°10 - Instalaciones de uso general",
      section: "5.1.3.3",
      url: SOURCE_URL,
      verifiedAt: VERIFIED_AT
    },
    evaluate(project) {
      if (!project.mainProtection) {
        return {
          status: "not-verifiable",
          message: "No existe información suficiente para verificar la protección general."
        };
      }

      if (project.system === "monofasico" && project.mainProtection.poles < 2) {
        return {
          status: "blocker",
          message:
            "En sistema monofásico, la protección general observada no evidencia corte omnipolar de fase y neutro."
        };
      }

      return {
        status: "pass",
        message: "La protección general registrada es compatible con corte omnipolar."
      };
    }
  },
  {
    id: "RIC10-5.1.3.5-DIFFERENTIAL-30MA",
    title: "Protección diferencial de circuitos de alumbrado",
    projectType: "TE1",
    severity: "blocker",
    source: {
      authority: "SEC",
      document: "Pliego Técnico Normativo RIC N°10 - Instalaciones de uso general",
      section: "5.1.3.5",
      url: SOURCE_URL,
      verifiedAt: VERIFIED_AT
    },
    evaluate(project) {
      const id = project.differentialProtection;
      if (!id) {
        return {
          status: "blocker",
          message: "No se ha registrado protección diferencial."
        };
      }
      if (id.residualCurrentMA > 30) {
        return {
          status: "blocker",
          message: `La sensibilidad diferencial registrada es ${id.residualCurrentMA} mA, superior a 30 mA.`
        };
      }
      return {
        status: "pass",
        message: `Protección diferencial registrada: ${id.residualCurrentMA} mA.`
      };
    }
  },
  {
    id: "RIC10-5.1.3.6-DIFFERENTIAL-OVERCURRENT",
    title: "Protección del diferencial frente a sobrecarga y cortocircuito",
    projectType: "TE1",
    severity: "blocker",
    source: {
      authority: "SEC",
      document: "Pliego Técnico Normativo RIC N°10 - Instalaciones de uso general",
      section: "5.1.3.6",
      url: SOURCE_URL,
      verifiedAt: VERIFIED_AT
    },
    evaluate(project) {
      const id = project.differentialProtection;
      const main = project.mainProtection;
      if (!id || !main) {
        return {
          status: "not-verifiable",
          message:
            "Falta información de la protección diferencial o de la protección termomagnética aguas arriba."
        };
      }

      const upstreamProtects =
        id.ratedCurrentA >= main.ratedCurrentA;

      const downstreamSumA = project.circuits.reduce(
        (sum, circuit) => sum + circuit.protection.ratedCurrentA,
        0
      );
      const downstreamCriterion = downstreamSumA <= id.ratedCurrentA;

      if (upstreamProtects || downstreamCriterion) {
        return {
          status: "pass",
          message:
            upstreamProtects
              ? "La corriente nominal del diferencial es igual o mayor que la protección termomagnética aguas arriba."
              : "La suma de corrientes nominales aguas abajo no supera la capacidad nominal del diferencial."
        };
      }

      return {
        status: "blocker",
        message:
          "No se verifica protección adecuada del diferencial: ni la protección aguas arriba ni la suma aguas abajo cumplen el criterio registrado."
      };
    }
  },
  {
    id: "RIC10-5.1.3.7-MAX-3-CIRCUITS-PER-ID",
    title: "Máximo de circuitos derivados desde una protección diferencial",
    projectType: "TE1",
    severity: "blocker",
    source: {
      authority: "SEC",
      document: "Pliego Técnico Normativo RIC N°10 - Instalaciones de uso general",
      section: "5.1.3.7",
      url: SOURCE_URL,
      verifiedAt: VERIFIED_AT
    },
    evaluate(project) {
      if (!project.differentialProtection) {
        return {
          status: "not-verifiable",
          message: "No existe protección diferencial registrada."
        };
      }

      if (project.circuits.length > 3) {
        return {
          status: "blocker",
          message: `Se registran ${project.circuits.length} circuitos dependientes del mismo diferencial; el máximo permitido por esta regla es 3.`
        };
      }

      return {
        status: "pass",
        message: `Se registran ${project.circuits.length} circuitos dependientes del diferencial.`
      };
    }
  },
  {
    id: "RIC10-5.2-DWELLING-MIN-MAIN-25A",
    title: "Protección mínima del empalme en vivienda",
    projectType: "TE1",
    severity: "blocker",
    source: {
      authority: "SEC",
      document: "Pliego Técnico Normativo RIC N°10 - Instalaciones de uso general",
      section: "5.2",
      url: SOURCE_URL,
      verifiedAt: VERIFIED_AT
    },
    evaluate(project) {
      if (
        project.destination !== "casa-habitacion" &&
        project.destination !== "departamento"
      ) {
        return {
          status: "pass",
          message: "La regla específica de vivienda no aplica al destino registrado."
        };
      }

      if (!project.mainProtection) {
        return {
          status: "not-verifiable",
          message:
            "No existe información suficiente de la protección principal para verificar el mínimo de vivienda."
        };
      }

      if (project.mainProtection.ratedCurrentA < 25) {
        return {
          status: "blocker",
          message:
            `La protección principal registrada es ${project.mainProtection.ratedCurrentA} A; para vivienda se requiere verificar un mínimo de 25 A según RIC N°10 § 5.2.`
        };
      }

      return {
        status: "pass",
        message:
          `Protección principal de vivienda registrada: ${project.mainProtection.ratedCurrentA} A.`
      };
    }
  },
  {
    id: "RIC10-5.2-DWELLING-MIN-CIRCUITS",
    title: "Cantidad mínima de circuitos en vivienda según superficie",
    projectType: "TE1",
    severity: "blocker",
    source: {
      authority: "SEC",
      document: "Pliego Técnico Normativo RIC N°10 - Instalaciones de uso general",
      section: "5.2",
      url: SOURCE_URL,
      verifiedAt: VERIFIED_AT
    },
    evaluate(project) {
      if (
        project.destination !== "casa-habitacion" &&
        project.destination !== "departamento"
      ) {
        return {
          status: "pass",
          message: "La regla específica de vivienda no aplica al destino registrado."
        };
      }

      if (project.surfaceM2 === undefined) {
        return {
          status: "not-verifiable",
          message:
            "Falta registrar la superficie de la vivienda para verificar la cantidad mínima de circuitos."
        };
      }

      const requiredCircuits = project.surfaceM2 < 30 ? 2 : 3;
      if (project.circuits.length < requiredCircuits) {
        return {
          status: "blocker",
          message:
            `Vivienda de ${project.surfaceM2} m²: se registran ${project.circuits.length} circuitos y se requieren al menos ${requiredCircuits} para esta verificación.`
        };
      }

      return {
        status: "pass",
        message:
          `Vivienda de ${project.surfaceM2} m²: se registran ${project.circuits.length} circuitos; mínimo verificado: ${requiredCircuits}.`
      };
    }
  }
];
