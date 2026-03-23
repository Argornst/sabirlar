import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserDefaultValues,
  createUserSchema,
} from "../../application/dto/createUserSchema";
import { createUser } from "../../application/use-cases/createUser";
import { usersRepository } from "../../infrastructure/repositories/usersRepository";

export function useCreateUserForm() {
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: createUserDefaultValues,
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      createUser({
        usersRepository,
        values,
      }),
    onSuccess: async () => {
      form.reset(createUserDefaultValues);
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
  });

  return {
    ...form,
    onSubmit,
    isSubmitting: mutation.isPending,
    submitError: mutation.error?.message ?? "",
  };
}