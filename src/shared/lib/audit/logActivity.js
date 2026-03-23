import { supabase } from "../supabaseClient";
import { auditRepository } from "./auditRepository";

export async function logActivity({
  action,
  entityType,
  entityId = null,
  actorUserId = null,
  actorEmail = null,
  metadata = {},
}) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let organizationId = null;

    if (user?.id) {
      const { data: profile } = await supabase
        .from("users")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      organizationId = profile?.organization_id ?? null;
    }

    await auditRepository.create({
      action,
      entity_type: entityType,
      entity_id: entityId ? String(entityId) : null,
      actor_user_id: actorUserId,
      actor_email: actorEmail,
      organization_id: organizationId,
      metadata,
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
}