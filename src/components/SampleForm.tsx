import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Required"),
  email: z.email("Invalid email"),
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          placeholder="Name"
          {...register("name")}
        />
        {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <input
          className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          placeholder="Email"
          {...register("email")}
        />
        {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
      </div>
      <button
        className="w-full rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-primary-glow transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        type="submit"
      >
        Submit
      </button>
    </form>
  );
}
