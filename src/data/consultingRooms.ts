export type RoomLevel = 1 | 2;

export interface ConsultingRoom {
  readonly number: number;
  readonly level: RoomLevel;
  readonly area: number;
  /** Mensualidad en USD antes de IVA; fuente: pedido comercial de fase 3. */
  readonly monthlyPrice: number;
  /** Ambientación ilustrativa, sin correspondencia física con el consultorio. */
  readonly referenceImage: string;
}

const images = {
  proposalOne: "/images/consultorios/consultorio-propuesta-1.webp",
  proposalTwo: "/images/consultorios/consultorio-propuesta-2.webp",
  private: "/images/consultorios/consultorio-privado.webp",
  spacious: "/images/consultorios/consultorio-amplio.webp",
  editorial: "/images/consultorios/consultorio-editorial.webp",
} as const;

export const consultingRooms: readonly ConsultingRoom[] = [
  { number: 1, level: 1, area: 16.20, monthlyPrice: 1207, referenceImage: images.proposalOne },
  { number: 2, level: 1, area: 16.10, monthlyPrice: 1200, referenceImage: images.proposalTwo },
  { number: 3, level: 1, area: 16.69, monthlyPrice: 1242, referenceImage: images.private },
  { number: 4, level: 2, area: 16.71, monthlyPrice: 1243, referenceImage: images.spacious },
  { number: 5, level: 2, area: 18.68, monthlyPrice: 1389, referenceImage: images.proposalTwo },
  { number: 6, level: 2, area: 19.05, monthlyPrice: 1417, referenceImage: images.proposalOne },
  { number: 7, level: 2, area: 17.51, monthlyPrice: 1302, referenceImage: images.editorial },
];

export function formatRoomArea(area: number): string {
  return `${area.toFixed(2).replace(".", ",")} m²`;
}

export function formatRoomPrice(price: number): string {
  return `$${String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}
