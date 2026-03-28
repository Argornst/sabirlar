import { useOrganizationsQuery } from "../hooks/useOrganizationsQuery";
import { useUpdateUserOrganization } from "../hooks/useUpdateUserOrganization";

export default function UserOrganizationSelect({ userItem }) {
  const { data: organizations = [], isLoading } = useOrganizationsQuery();
  const mutation = useUpdateUserOrganization();

  async function handleChange(event) {
  const rawValue = event.target.value;
  const nextOrganizationId = rawValue === "" ? null : Number(rawValue);

  console.log("organization change clicked", {
    userId: userItem?.id,
    current: userItem?.organizationId,
    next: nextOrganizationId,
  });

  if (!userItem?.id) {
    console.log("userId yok!");
    return;
  }

  if (nextOrganizationId === Number(userItem.organizationId ?? null)) {
    console.log("aynı organizasyon seçildi, işlem yapılmadı");
    return;
  }

  try {
    await mutation.mutateAsync({
      userId: userItem.id,
      organizationId: nextOrganizationId,
    });

    console.log("organization mutation gönderildi");
  } catch (error) {
    console.error("User organization update error:", error);
  }
}
}