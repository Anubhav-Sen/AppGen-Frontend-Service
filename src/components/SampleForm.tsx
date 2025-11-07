import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"


const schema = z.object({
    name: z.string().min(1, "Required"),
    email: z.email("Invalid email"),
})

type FormData = z.infer<typeof schema>

export default function SampleForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const onSubmit = (data: FormData) => {
        console.log("FormData", data)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <div>
                <input className="border p-2 w-full" placeholder="Name" {...register("name")}/>
                {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
            </div>
             <div>
                <input className="border p-2 w-full" placeholder="Email" {...register("email")}/>
                {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
            </div>
            <button className="px-3 py-2 bg-black text-white rounded" type="submit">Submit</button>
        </form>
    )
}