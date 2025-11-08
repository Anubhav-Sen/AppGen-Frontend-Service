import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "./ui/FormInput";

const schema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
});

type FormData = z.infer<typeof schema>;

export default function SampleForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log("FormData", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormInput
        label="Name"
        placeholder="Name"
        error={errors.name}
        {...register("name")}
      />

      <FormInput
        label="Email"
        type="email"
        placeholder="Email"
        error={errors.email}
        {...register("email")}
      />

      <button
        className="w-full rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-primary-glow transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        type="submit"
      >
        Submit
      </button>
    </form>
  );
}
