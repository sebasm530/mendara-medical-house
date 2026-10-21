"use server";

import { deliverVisitRequest } from "@/lib/visitDelivery";
import type { VisitResult } from "@/lib/visitValidation";

export async function submitVisitRequest(form: FormData): Promise<VisitResult> {
  return deliverVisitRequest(form);
}
