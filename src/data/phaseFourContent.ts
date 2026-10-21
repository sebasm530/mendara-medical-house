export interface DoctorProfile {
  name: string;
  specialty: string;
  medicalCode?: string;
  status: "pending-confirmation" | "confirmed";
  quote: string | null;
  photo: { src: string; alt: string } | null;
}

/** Testimonio editorial abreviado facilitado por el usuario; pendiente de aprobación definitiva. */
export const doctorProfile: DoctorProfile = {
  name: "Dra. Fabiola Cárdenas",
  specialty: "Cirugía General y Coloproctología",
  medicalCode: "MED14496",
  status: "pending-confirmation",
  quote: "Siempre he creído que la experiencia del paciente comienza mucho antes de entrar a la consulta. Mendara refleja mi manera de ejercer la medicina: un espacio elegante, acogedor y funcional, donde cada detalle también es una forma de cuidar.",
  photo: { src: "/images/personal/doctora.webp", alt: "Dra. Fabiola Cárdenas" },
};

export const facilities = [
  { name: "Recepción", image: "/images/instalaciones/recepcion-vista-lateral.webp", alt: "Render propuesto de recepción con mostrador y sillones de espera." },
  { name: "Sala de espera", image: "/images/instalaciones/sala-espera.webp", alt: "Ambientación de referencia de sala de espera con sillones y acabados cálidos." },
  { name: "Zonas comunes", image: "/images/instalaciones/coffee-bar.webp", alt: "Render propuesto de zona común con asientos y estación de café." },
  { name: "Baños", image: "/images/instalaciones/bano-propuesta.webp", alt: "Render de propuesta de baño con espejo circular y mueble de madera." },
] as const;

/** Datos comerciales proporcionados por el usuario en la fase 4. */
export const investmentTerms = {
  startingMonthlyPriceUsd: 1200,
  contractYears: 3,
  expectedAvailability: { iso: "2026-11-01", label: "1 de noviembre de 2026" },
  founder: {
    title: "Quien firma primero, elige primero",
    description: "Cada especialidad tiene un solo consultorio. Quien firma primero elige el suyo, y cuando una especialidad se asigna, deja de estar disponible para otro colega.",
  },
} as const;

export const locationContent = { locality: "La Sabana, San José, Costa Rica." } as const;
